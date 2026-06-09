"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBuild, getBuilds, Build } from "@/lib/builds";
import Clock from "@/components/Clock";
import PostBody from "@/components/PostBody";
import Ticker from "@/components/Ticker";

function readTime(body: string) {
  const words = (body.match(/\S+/g) || []).length;
  return Math.max(1, Math.round(words / 220));
}

type Heading = { level: 1 | 2; text: string; id: string };
function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  for (const line of body.split("\n")) {
    const m2 = line.match(/^##\s+(.+)$/);
    const m1 = !m2 && line.match(/^#\s+(.+)$/);
    if (m2) out.push({ level: 2, text: m2[1], id: m2[1].toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") });
    else if (m1) out.push({ level: 1, text: m1[1], id: m1[1].toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") });
  }
  return out;
}

export default function BuildPage() {
  const { slug } = useParams<{ slug: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [prev, setPrev] = useState<Build | null>(null);
  const [next, setNext] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([getBuild(slug), getBuilds()]).then(([b, all]) => {
      setBuild(b);
      const idx = all.findIndex((a) => a.slug === slug);
      setPrev(all[idx + 1] || null);
      setNext(all[idx - 1] || null);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);
      const headings = Array.from(document.querySelectorAll("article h1[id], article h2[id]"));
      let current = "";
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= 100) current = el.id;
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <div style={{ background: "#0d0e10", color: "#5e6770", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, letterSpacing: "0.2em" }}>LOADING…</div>;
  if (!build) return <div style={{ background: "#0d0e10", color: "#ff4dd2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, letterSpacing: "0.2em" }}>BUILD NOT FOUND</div>;

  const mins = readTime(build.body || "");

  return (
    <div className="post-root">
      <header className="v3-doc-head">
        <div>DOC <b>building / {build.slug}</b></div>
        <div className="center"><Link href="/">← BACK TO HOME</Link></div>
        <div className="right"><Clock /></div>
      </header>

      <div style={{ borderBottom: "1px solid var(--rule)" }}>
        <Ticker />
      </div>

      <div className="post-shell">
        <aside className="post-left">
          <Link className="back" href="/building">← ALL BUILDS</Link>
          <h5>/ META</h5>
          <dl>
            <dt>BUILD_ID</dt><dd>{build.slug}</dd>
            <dt>DATE</dt><dd>{build.date}</dd>
            <dt>TAG</dt><dd className="tag">BUILD</dd>
            <dt>READ</dt><dd>{mins} MIN</dd>
          </dl>
        </aside>

        <article>
          <div className="crumbs">~ / building / {(build.date || "").slice(0, 4)} / {build.slug}</div>
          <span className="tag-badge">BUILD</span>
          <h1>{build.title}</h1>
          {build.dek && <p className="dek">{build.dek}</p>}
          <div className="meta-band">
            <div><span className="l">/ BY</span><span className="v">Choi Juhwan</span></div>
            <div><span className="l">/ PUBLISHED</span><span className="v">{build.date}</span></div>
            <div><span className="l">/ TAG</span><span className="v">BUILD</span></div>
            <div><span className="l">/ READ TIME</span><span className="v">{mins} MIN</span></div>
            <div><span className="l">/ STATUS</span><span className="v">{build.status}</span></div>
          </div>
          {build.links && build.links.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0 32px" }}>
              {build.links.map((lk, i) => (
                <a
                  key={i}
                  href={lk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 14px",
                    border: "1px solid rgba(0,229,255,0.3)",
                    color: "#00e5ff",
                    fontSize: 11, letterSpacing: "0.16em",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,229,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  ↗ {lk.label}
                </a>
              ))}
            </div>
          )}
          <PostBody body={build.body || ""} />

          <div style={{ marginTop: 64, paddingTop: 28, borderTop: "1px solid var(--cyan)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {prev ? (
              <Link href={`/building/${prev.slug}`} style={{ border: "1px solid var(--rule)", padding: 18, display: "block" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--cyan)", marginBottom: 8 }}>← PREVIOUS</div>
                <div style={{ fontFamily: "Space Grotesk, monospace", fontSize: 20, fontWeight: 600, color: "var(--fg)", lineHeight: 1.2 }}>{prev.title}</div>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/building/${next.slug}`} style={{ border: "1px solid var(--rule)", padding: 18, display: "block", textAlign: "right" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--cyan)", marginBottom: 8 }}>NEXT →</div>
                <div style={{ fontFamily: "Space Grotesk, monospace", fontSize: 20, fontWeight: 600, color: "var(--fg)", lineHeight: 1.2 }}>{next.title}</div>
              </Link>
            ) : <div />}
          </div>
        </article>

        <aside style={{ position: "sticky", top: 90, alignSelf: "start", fontSize: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--dim)", marginBottom: 14, fontWeight: 500 }}>/ PROGRESS</div>
          <div style={{ border: "1px solid var(--rule)", height: 4, position: "relative", marginBottom: 6 }}>
            <div style={{ height: "100%", background: "var(--cyan)", width: `${progress}%`, transition: "width 80ms linear" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.16em", marginBottom: 24 }}>{progress}% READ · {mins} MIN</div>

          {(() => {
            const headings = extractHeadings(build.body || "");
            return headings.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--dim)", marginBottom: 10, fontWeight: 500 }}>/ CONTENTS</div>
                <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      style={{
                        display: "block",
                        paddingLeft: h.level === 2 ? 10 : 0,
                        fontSize: h.level === 1 ? 11 : 10,
                        color: activeId === h.id ? "var(--cyan)" : "var(--dim)",
                        textDecoration: "none",
                        lineHeight: 1.5,
                        borderLeft: h.level === 2 ? `1px solid ${activeId === h.id ? "var(--cyan)" : "var(--rule)"}` : "none",
                        transition: "color 150ms",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >{h.text}</a>
                  ))}
                </nav>
              </div>
            ) : null;
          })()}
        </aside>
      </div>

      <footer className="pf-foot">
        <div>© 2026 CHOI JUHWAN · <span>NO COOKIES · NO ANALYTICS</span></div>
        <div>SET IN <span>SPACE GROTESK + JETBRAINS MONO</span></div>
      </footer>
    </div>
  );
}
