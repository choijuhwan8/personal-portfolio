"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getNews, NewsItem } from "@/lib/news";
import Clock from "@/components/Clock";

const CAT_COLORS: Record<string, string> = {
  MARKETS: "#aaff00",
  DEFI: "#00e5ff",
  REGULATION: "#ff4dd2",
  INFRASTRUCTURE: "#a78bfa",
  NFT: "#f59e0b",
  MACRO: "#5e6770",
};

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { getNews(200).then(setItems); }, []);

  const cats = ["ALL", "MARKETS", "DEFI", "REGULATION", "INFRASTRUCTURE", "NFT", "MACRO"];

  const filtered = items
    .filter((i) => cat === "ALL" || i.category === cat)
    .filter((i) => !search || (i.title + " " + i.summary + " " + i.body).toLowerCase().includes(search.toLowerCase()));

  const byDate: Record<string, NewsItem[]> = {};
  filtered.forEach((i) => {
    const d = i.date || "";
    (byDate[d] = byDate[d] || []).push(i);
  });
  const dates = Object.keys(byDate).sort().reverse();

  return (
    <div style={{ background: "#0d0e10", minHeight: "100vh" }}>
      <header className="ar-head">
        <div>DOC <b>news / index</b></div>
        <div className="center"><Link href="/">← BACK TO HOME</Link></div>
        <div className="right"><Clock /></div>
      </header>

      <div className="ar-shell">
        <div className="ar-title">
          <div>
            <span className="stamp">/ CRYPTO NEWS</span>
            <h1>The <span className="underline">feed</span>.</h1>
          </div>
          <div className="meta">
            <div><b>{items.length}</b> ITEMS</div>
            <div>UPDATED DAILY 8PM SGT</div>
            <div style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.14em", marginTop: 4 }}>CURATED & SELECTED BY CLAUDE HAIKU · ANTHROPIC</div>
          </div>
        </div>

        <div className="ar-filter">
          <span className="l">/ FILTER</span>
          {cats.map((c) => (
            <button key={c} className={cat === c ? "active" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
          <input type="text" placeholder="search headlines…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div>
          {dates.map((d) => (
            <div key={d}>
              <div className="year-h" style={{ fontSize: 24, marginTop: 36 }}>{d}<span>{byDate[d].length} ITEMS</span></div>
              {byDate[d].map((item) => (
                <div key={item.id} className="news-card" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <div className="news-card-head">
                    <div className="left">
                      {item.category && (
                        <span className="cat" style={{ color: CAT_COLORS[item.category] || "#5e6770" }}>{item.category}</span>
                      )}
                      <div className="ttl">{item.title}</div>
                      <div className="sum">{item.summary}</div>
                    </div>
                    <div className="right">
                      <span className="src">{item.source}</span>
                      <span className="toggle">{expanded === item.id ? "−" : "+"}</span>
                    </div>
                  </div>
                  {expanded === item.id && (
                    <div className="news-card-body">
                      <p>{item.body?.replace(/<cite[^>]*>|<\/cite>/g, "")}</p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="src-link">
                        READ SOURCE ↗ {item.source}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "#5e6770", border: "1px dashed rgba(255,255,255,0.18)", fontSize: 12, letterSpacing: "0.16em" }}>// no items yet</div>
          )}
        </div>
      </div>

      <footer className="ar-foot">
        <div>© 2026 CHOI JUHWAN · <span>CRYPTO NEWS · CURATED BY CLAUDE</span></div>
        <div>SET IN <span>SPACE GROTESK + JETBRAINS MONO</span></div>
      </footer>
    </div>
  );
}
