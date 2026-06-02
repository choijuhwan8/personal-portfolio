"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPosts, Post } from "@/lib/posts";
import Clock from "@/components/Clock";

const TAGS = ["ALL", "STUDY", "OPINION"];
const TAG_LABEL: Record<string, string> = { STUDY: "STUDY BLOG" };

export default function WritingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tag, setTag] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  const filtered = posts
    .filter((p) => tag === "ALL" || p.tag === tag)
    .filter((p) => !search || (p.title + " " + p.dek).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const byYear: Record<string, Post[]> = {};
  filtered.forEach((p) => {
    const y = (p.date || "").slice(0, 4);
    (byYear[y] = byYear[y] || []).push(p);
  });
  const years = Object.keys(byYear).sort().reverse();

  const totalFiltered = filtered.length;
  let idx = 0;
  return (
    <div style={{ background: "#0d0e10", minHeight: "100vh" }}>
      <header className="ar-head">
        <div>DOC <b>writing / index</b></div>
        <div className="center"><Link href="/">← BACK TO HOME</Link></div>
        <div className="right"><Clock /></div>
      </header>

      <div className="ar-shell">
        <div className="ar-title">
          <div>
            <span className="stamp">/ ALL WRITING</span>
            <h1>The <span className="underline">writing</span>.</h1>
          </div>
          <div className="meta">
            <div><b>{posts.length}</b> POSTS</div>
            <div>UPDATED WEEKLY</div>
          </div>
        </div>

        <div className="ar-filter">
          <span className="l">/ FILTER</span>
          {TAGS.map((t) => (
            <button key={t} className={tag === t ? "active" : ""} onClick={() => setTag(t)}>{TAG_LABEL[t] || t}</button>
          ))}
          <input type="text" placeholder="search titles / topics…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div>
          {years.map((y) => (
            <div key={y}>
              <div className="year-h">{y}<span>{byYear[y].length} POSTS</span></div>
              {byYear[y].map((p) => {
                const num = totalFiltered - idx;
                idx++;
                return (
                  <Link key={p.slug} className="ar-post" href={`/writing/${p.slug}`}>
                    <span className="idx">/{String(num).padStart(3, "0")}</span>
                    <span className="date">{p.date}</span>
                    <div>
                      <div className="ttl">{p.title}</div>
                      <div className="dek">{p.dek && p.dek.length > 80 ? p.dek.slice(0, 80) + "…" : p.dek}</div>
                    </div>
                    <span className="tag">{p.tag === "RESEARCH" ? "OPINION" : p.tag}</span>
                    <span className="stat"></span>
                  </Link>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "#5e6770", border: "1px dashed rgba(255,255,255,0.18)" }}>// no matches</div>
          )}
        </div>
      </div>

      <footer className="ar-foot">
        <div>© 2026 CHOI JUHWAN · <span>WRITING ARCHIVE</span></div>
        <div>SET IN <span>SPACE GROTESK + JETBRAINS MONO</span></div>
      </footer>
    </div>
  );
}
