"use client";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { md2html } from "@/components/PostBody";

const PASS = "letmein";

interface BuildLink { label: string; url: string; }
interface Draft {
  id: string; title: string; dek: string; tag: string;
  date: string; status: string; slug: string; body: string; updated: number;
  links?: BuildLink[];
}

function slugify(title: string, existingSlugs: string[] = [], currentId = ""): string {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
  const others = existingSlugs.filter((_, i) => i !== existingSlugs.indexOf(currentId));
  if (!others.includes(base)) return base;
  let i = 2;
  while (others.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function newDraft(): Draft {
  return { id: "d-" + Date.now(), title: "", dek: "", tag: "RESEARCH", date: new Date().toISOString().slice(0, 10), status: "draft", slug: "untitled", body: "", updated: Date.now(), links: [] };
}

const STORE_KEY = "juhwan_drafts_v1";
const BUILD_STORE_KEY = "juhwan_builds_v1";
function loadDrafts(): Draft[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}
function saveDrafts(arr: Draft[]) { localStorage.setItem(STORE_KEY, JSON.stringify(arr)); }
function loadBuilds(): Draft[] {
  try { return JSON.parse(localStorage.getItem(BUILD_STORE_KEY) || "[]"); } catch { return []; }
}
function saveBuilds(arr: Draft[]) { localStorage.setItem(BUILD_STORE_KEY, JSON.stringify(arr)); }

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"writing" | "building">("writing");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [builds, setBuilds] = useState<Draft[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const [publishState, setPublishState] = useState("");
  const [fetchState, setFetchState] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = mode === "writing" ? drafts : builds;
  const setItems = mode === "writing" ? setDrafts : setBuilds;
  const saveItems = mode === "writing" ? saveDrafts : saveBuilds;
  const cur = items.find((d) => d.id === currentId);

  useEffect(() => {
    if (sessionStorage.getItem("admin_ok") === "1") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    let d = loadDrafts();
    if (!d.length) {
      d = [{ ...newDraft(), title: "Welcome to the editor", dek: "A starter draft you can edit, save, or delete.", body: "# Welcome\n\nStart writing here." }];
      saveDrafts(d);
    }
    setDrafts(d);
    const b = loadBuilds();
    setBuilds(b);
    setCurrentId(d[0].id);
  }, [unlocked]);

  useEffect(() => {
    const list = mode === "writing" ? drafts : builds;
    if (list.length) setCurrentId(list[0].id);
    else setCurrentId("");
  }, [mode]);

  function unlock() {
    if (pass === PASS) { sessionStorage.setItem("admin_ok", "1"); setUnlocked(true); }
    else { setErr("// wrong passphrase"); setPass(""); }
  }

  function update(field: keyof Draft, value: string) {
    setItems((prev) => {
      const next = prev.map((d) => {
        if (d.id !== currentId) return d;
        const updated: Draft = { ...d, [field]: value, updated: Date.now() };
        if (field === "title") updated.slug = slugify(value, prev.map(x => x.slug), d.slug);
        return updated;
      });
      setSaveState("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { saveItems(next); setSaveState("saved"); }, 600);
      return next;
    });
  }

  function persist() {
    saveItems(items);
    setSaveState("saved");
  }

  async function publish() {
    if (!cur) return;
    setPublishState("PUBLISHING…");
    const updated = items.map((d) => d.id === currentId ? { ...d, status: "published" } : d);
    setItems(updated);
    saveItems(updated);
    const collection_ = mode === "writing" ? "posts" : "builds";
    try {
      await setDoc(doc(db, collection_, cur.slug), {
        id: cur.slug, title: cur.title, dek: cur.dek, tag: cur.tag,
        date: cur.date, status: "published", slug: cur.slug, body: cur.body,
        links: (mode === "building" ? (cur.links || []) : []),
        updatedAt: Date.now(),
      });
      setPublishState("PUBLISHED ✓");
    } catch (e: any) {
      setPublishState("ERROR: " + e.message);
    }
    setTimeout(() => setPublishState(""), 2000);
  }

  async function fetchFromFirebase() {
    setFetchState("LOADING…");
    const collection_ = mode === "writing" ? "posts" : "builds";
    try {
      const snap = await getDocs(collection(db, collection_));
      setItems((prev) => {
        const next = [...prev];
        snap.forEach((docSnap) => {
          const p = docSnap.data();
          if (!next.find((d) => d.slug === p.slug)) {
            next.unshift({ id: "d-" + p.slug, title: p.title || "", dek: p.dek || "", tag: p.tag || "", date: p.date || "", status: p.status || "published", slug: p.slug || "", body: p.body || "", links: p.links || [], updated: p.updatedAt || Date.now() });
          }
        });
        saveItems(next);
        return next;
      });
      setFetchState("LOADED ✓");
    } catch (e: any) {
      setFetchState("ERROR: " + e.message);
    }
    setTimeout(() => setFetchState(""), 2000);
  }

  async function deleteDraft() {
    if (!confirm("Delete this draft?")) return;
    const next = items.filter((d) => d.id !== currentId);
    const final = next.length ? next : [];
    setItems(final);
    saveItems(final);
    setCurrentId(final[0]?.id || "");
  }

  async function deleteFromFirebase() {
    if (!cur || !confirm(`Delete "${cur.title || cur.slug}" from Firebase?`)) return;
    const collection_ = mode === "writing" ? "posts" : "builds";
    await deleteDoc(doc(db, collection_, cur.slug));
    deleteDraft();
  }

  function exportMd() {
    if (!cur) return;
    const fm = `---\ntitle: "${cur.title}"\ndek: "${cur.dek}"\ntag: ${cur.tag}\ndate: ${cur.date}\nstatus: ${cur.status}\nslug: ${cur.slug}\n---\n\n`;
    const blob = new Blob([fm + cur.body], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (cur.slug || "untitled") + ".md"; a.click();
  }

  const [uploadState, setUploadState] = useState("");

  async function handleImageDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setUploadState("UPLOADING…");
    try {
      const storageRef = ref(storage, `post-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const ta = document.getElementById("body-ta") as HTMLTextAreaElement;
      const s = ta.selectionStart;
      const md = `![${file.name}](${url})`;
      const next = ta.value.slice(0, s) + md + ta.value.slice(s);
      update("body", next);
      setUploadState("UPLOADED ✓");
    } catch (e: any) {
      setUploadState("ERROR: " + e.message);
    }
    setTimeout(() => setUploadState(""), 2000);
  }

  function insertMd(a: string, b = "") {
    const ta = document.getElementById("body-ta") as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e);
    ta.value = ta.value.slice(0, s) + a + sel + b + ta.value.slice(e);
    ta.focus(); ta.selectionStart = s + a.length; ta.selectionEnd = s + a.length + sel.length;
    update("body", ta.value);
  }

  if (!unlocked) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0d0e10", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ border: "1px solid #00e5ff", background: "#14161a", padding: 32, width: 380, maxWidth: "90vw" }}>
          <h1 style={{ fontFamily: "Space Grotesk, monospace", fontSize: 28, fontWeight: 700, color: "#e6ecec", marginBottom: 4 }}>admin<span style={{ color: "#00e5ff" }}>.</span></h1>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00e5ff", marginBottom: 20 }}>/ COMPOSE · INTERNAL</div>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()} placeholder="passphrase…" autoFocus style={{ width: "100%", fontFamily: "inherit", padding: "12px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "#e6ecec", marginBottom: 8, letterSpacing: "0.16em", fontSize: 13 }} />
          {err && <div style={{ color: "#ff4dd2", fontSize: 11, marginBottom: 8 }}>{err}</div>}
          <button onClick={unlock} style={{ width: "100%", padding: "10px", background: "#00e5ff", color: "#000", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: "0.16em" }}>ENTER</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d0e10", color: "#e6ecec", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
      <header style={{ display: "grid", gridTemplateColumns: `${sidebarOpen ? "240px" : "40px"} 1fr 320px`, padding: "12px 24px", borderBottom: "1px solid #00e5ff", fontSize: 11, letterSpacing: "0.16em", color: "#5e6770", background: "#0d0e10", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setSidebarOpen((o) => !o)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#5e6770", cursor: "pointer", fontFamily: "inherit", fontSize: 11, padding: "2px 6px", lineHeight: 1 }}>{sidebarOpen ? "←" : "→"}</button>
          {sidebarOpen && <span>DOC <b style={{ color: "#e6ecec" }}>admin / compose</b></span>}
        </div>
        <div style={{ textAlign: "center", color: "#00e5ff" }}><Link href="/" style={{ color: "#00e5ff" }}>← / SITE</Link> · <Link href="/writing" style={{ color: "#00e5ff" }}>/ WRITING</Link></div>
        <div style={{ textAlign: "right", color: saveState === "saved" ? "#aaff00" : saveState === "dirty" ? "#ff4dd2" : "#5e6770" }}>● {saveState.toUpperCase()}</div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: `${sidebarOpen ? "240px" : "40px"} 1fr 320px`, flex: 1, overflow: "hidden" }}>
        <aside style={{ borderRight: "1px solid rgba(255,255,255,0.1)", background: "#14161a", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {(["writing", "building"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} style={{ padding: "10px", fontSize: 10, letterSpacing: "0.16em", background: mode === m ? "rgba(0,229,255,0.08)" : "none", border: 0, borderBottom: mode === m ? "2px solid #00e5ff" : "2px solid transparent", color: mode === m ? "#00e5ff" : "#5e6770", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>{m}</button>
                ))}
              </div>
              <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
                <button onClick={() => { const d = newDraft(); setItems((p) => { const n = [d, ...p]; saveItems(n); return n; }); setCurrentId(d.id); }} style={{ width: "100%", border: "1px solid #00e5ff", color: "#00e5ff", padding: "10px 12px", fontSize: 11, letterSpacing: "0.16em", marginBottom: 8, cursor: "pointer", background: "none", fontFamily: "inherit" }}>+ NEW {mode === "writing" ? "DRAFT" : "BUILD"}</button>
                <button onClick={fetchFromFirebase} style={{ width: "100%", border: "1px solid #aaff00", color: "#aaff00", padding: "10px 12px", fontSize: 11, letterSpacing: "0.16em", marginBottom: 18, cursor: "pointer", background: "none", fontFamily: "inherit" }}>{fetchState || "↓ LOAD FROM FIREBASE"}</button>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5e6770", marginBottom: 10 }}>/ {mode === "writing" ? "DRAFTS" : "BUILDS"}</div>
                {items.map((d) => (
                  <div key={d.id} onClick={() => setCurrentId(d.id)} style={{ padding: "10px 12px", borderTop: `1px solid ${d.id === currentId ? "#00e5ff" : "transparent"}`, borderLeft: `1px solid ${d.id === currentId ? "#00e5ff" : "transparent"}`, borderRight: `1px solid ${d.id === currentId ? "#00e5ff" : "transparent"}`, borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: d.id === currentId ? "rgba(0,229,255,0.05)" : "none", marginBottom: 2 }}>
                    <div style={{ fontFamily: "Space Grotesk, monospace", fontSize: 14, fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>{d.title || "(untitled)"}</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#5e6770", display: "flex", justifyContent: "space-between" }}>
                      <span>{d.date}</span>
                      <span style={{ color: d.status === "published" ? "#aaff00" : "#5e6770" }}>{d.status}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div style={{ fontSize: 11, color: "#5e6770", padding: "12px 0" }}>// no {mode === "writing" ? "drafts" : "builds"} yet</div>}
              </div>
            </div>
          )}
        </aside>

        <main style={{ padding: "24px 32px 80px", minWidth: 0, overflowY: "auto" }}>
          {cur && (
            <>
              <input value={cur.title} onChange={(e) => update("title", e.target.value)} placeholder="A title that says something." style={{ width: "100%", fontFamily: "Space Grotesk, monospace", fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", background: "none", border: 0, color: "#e6ecec", marginBottom: 16, lineHeight: 1 }} />
              <input value={cur.dek} onChange={(e) => update("dek", e.target.value)} placeholder="One-sentence dek." style={{ width: "100%", fontFamily: "Newsreader, serif", fontSize: 20, background: "none", border: 0, color: "#c0c8cc", marginBottom: 20 }} />
              {mode === "building" && (
                <div style={{ marginBottom: 20, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5e6770", marginBottom: 8 }}>/ LINKS</div>
                  {(cur.links || []).map((lk, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input
                        value={lk.label}
                        placeholder="Label (e.g. GitHub)"
                        onChange={(e) => { const l = [...(cur.links||[])]; l[i] = { ...l[i], label: e.target.value }; update("links", l); }}
                        style={{ flex: "0 0 120px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#e6ecec", padding: "6px 10px", fontSize: 12, fontFamily: "inherit" }}
                      />
                      <input
                        value={lk.url}
                        placeholder="https://..."
                        onChange={(e) => { const l = [...(cur.links||[])]; l[i] = { ...l[i], url: e.target.value }; update("links", l); }}
                        style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#e6ecec", padding: "6px 10px", fontSize: 12, fontFamily: "inherit" }}
                      />
                      <button onClick={() => { const l = (cur.links||[]).filter((_,j) => j !== i); update("links", l); }} style={{ border: "1px solid rgba(255,77,210,0.3)", color: "#ff4dd2", background: "none", padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => update("links", [...(cur.links||[]), { label: "", url: "" }])} style={{ border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff", background: "none", padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.14em" }}>+ ADD LINK</button>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: mode === "writing" ? "1fr 1fr 1fr" : "1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 24 }}>
                {(mode === "writing" ? (["tag", "date", "status"] as (keyof Draft)[]) : (["date", "status"] as (keyof Draft)[])).map((f) => (
                  <div key={f} style={{ padding: "10px 12px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "#5e6770", marginBottom: 4 }}>/ {f.toUpperCase()}</span>
                    {f === "tag" ? (
                      <select value={cur.tag} onChange={(e) => update("tag", e.target.value)} style={{ background: "none", border: 0, color: "#e6ecec", fontFamily: "inherit", fontSize: 12, width: "100%" }}>
                        {[["OPINION","OPINION"],["STUDY","STUDY BLOG"]].map(([v,l]) => <option key={v} value={v} style={{ background: "#0d0e10" }}>{l}</option>)}
                      </select>
                    ) : f === "status" ? (
                      <select value={cur.status} onChange={(e) => update("status", e.target.value)} style={{ background: "none", border: 0, color: "#e6ecec", fontFamily: "inherit", fontSize: 12, width: "100%" }}>
                        <option style={{ background: "#0d0e10" }}>draft</option>
                        <option style={{ background: "#0d0e10" }}>published</option>
                      </select>
                    ) : (
                      <input value={cur[f] as string} onChange={(e) => update(f, e.target.value)} style={{ background: "none", border: 0, color: "#e6ecec", fontFamily: "inherit", fontSize: 12, width: "100%" }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.1)", padding: 6, background: "#14161a", marginBottom: 0 }}>
                {[["H1","# "],["H2","## "],["H3","### "]].map(([l,m]) => <button key={l} onClick={() => insertMd(m)} style={{ padding: "6px 10px", fontSize: 11, border: "1px solid transparent", color: "#5e6770", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}
                <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
                {[["B","**","**"],["I","_","_"],["code","`","`"]].map(([l,a,b]) => <button key={l} onClick={() => insertMd(a, b)} style={{ padding: "6px 10px", fontSize: 11, border: "1px solid transparent", color: "#5e6770", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}
                <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
                {[["quote","> "],["list","- "]].map(([l,m]) => <button key={l} onClick={() => insertMd(m)} style={{ padding: "6px 10px", fontSize: 11, border: "1px solid transparent", color: "#5e6770", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>)}
              </div>
              <textarea id="body-ta" value={cur.body} onChange={(e) => update("body", e.target.value)} onDragOver={(e) => e.preventDefault()} onDrop={handleImageDrop} style={{ width: "100%", minHeight: 520, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderTop: 0, color: "#e6ecec", padding: 24, fontFamily: "JetBrains Mono, monospace", fontSize: 14, lineHeight: 1.7, resize: "vertical" }} />
              {uploadState && <div style={{ fontSize: 11, letterSpacing: "0.16em", color: uploadState.startsWith("ERROR") ? "#ff4dd2" : "#aaff00", marginTop: 4 }}>{uploadState}</div>}
              <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={persist} style={{ padding: "12px 20px", background: "#00e5ff", color: "#000", border: "1px solid #00e5ff", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit" }}>SAVE DRAFT</button>
                <button onClick={publish} style={{ padding: "12px 20px", border: "1px solid rgba(255,255,255,0.1)", color: "#e6ecec", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit" }}>{publishState || "PUBLISH →"}</button>
                <button onClick={exportMd} style={{ padding: "12px 20px", border: "1px solid rgba(255,255,255,0.1)", color: "#e6ecec", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit" }}>EXPORT .MD</button>
                <button onClick={deleteDraft} style={{ padding: "12px 20px", border: "1px solid rgba(255,77,210,0.4)", color: "#ff4dd2", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit" }}>DELETE LOCAL</button>
                <button onClick={deleteFromFirebase} style={{ padding: "12px 20px", border: "1px solid rgba(255,77,210,0.4)", color: "#ff4dd2", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit" }}>DELETE FROM DB</button>
              </div>
            </>
          )}
        </main>

        <aside style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", padding: "24px 20px", background: "rgba(20,22,26,0.6)", fontSize: 12, color: "#5e6770", overflowY: "auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5e6770", marginBottom: 10 }}>/ PREVIEW</div>
          {cur && (
            <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: 16, background: "#0d0e10", minHeight: 200, fontFamily: "Newsreader, serif", color: "#c0c8cc", fontSize: 14, lineHeight: 1.6 }}>
              {cur.title && <div style={{ fontFamily: "Space Grotesk, monospace", fontSize: 22, color: "#e6ecec", marginBottom: 8, fontWeight: 700 }}>{cur.title}</div>}
              {cur.dek && <p style={{ color: "#5e6770", fontStyle: "italic", marginBottom: 12 }}>{cur.dek}</p>}
              <div style={{ fontSize: 13 }} dangerouslySetInnerHTML={{ __html: md2html(cur.body) }} />
            </div>
          )}
          {cur && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 18 }}>
              {[["WORDS", (cur.body.match(/\S+/g) || []).length.toLocaleString()], ["READ", Math.max(1, Math.round((cur.body.match(/\S+/g) || []).length / 220)) + " m"], ["CHARS", cur.body.length.toLocaleString()], ["HEADS", (cur.body.match(/^#{1,3}\s+/gm) || []).length.toString()]].map(([l, v]) => (
                <div key={l} style={{ padding: 10, borderRight: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontFamily: "Space Grotesk, monospace", fontSize: 22, color: "#00e5ff", display: "block", fontWeight: 700 }}>{v}</span>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5e6770", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

