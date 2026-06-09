"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBuilds, extractFirstImage, Build } from "@/lib/builds";
import Clock from "@/components/Clock";

export default function BuildingPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { getBuilds().then(setBuilds); }, []);

  const filtered = builds.filter((b) =>
    !search || (b.title + " " + b.dek).toLowerCase().includes(search.toLowerCase())
  );

  const byYear: Record<string, Build[]> = {};
  filtered.forEach((b) => {
    const y = (b.date || "").slice(0, 4);
    (byYear[y] = byYear[y] || []).push(b);
  });
  const years = Object.keys(byYear).sort().reverse();

  let idx = 0;
  return (
    <div style={{ background: "#0d0e10", minHeight: "100vh" }}>
      <header className="ar-head">
        <div>DOC <b>building / index</b></div>
        <div className="center"><Link href="/">← BACK TO HOME</Link></div>
        <div className="right"><Clock /></div>
      </header>

      <div className="ar-shell">
        <div className="ar-title">
          <div>
            <span className="stamp">/ ALL BUILDS</span>
            <h1>The <span className="underline">building</span>.</h1>
          </div>
          <div className="meta">
            <div><b>{builds.length}</b> BUILDS</div>
            <div>THINGS I SHIP</div>
          </div>
        </div>

        <div className="ar-filter">
          <span className="l">/ SEARCH</span>
          <input type="text" placeholder="search builds…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div>
          {years.map((y) => (
            <div key={y}>
              <div className="year-h">{y}<span>{byYear[y].length} BUILDS</span></div>
              {byYear[y].map((b) => {
                const img = extractFirstImage(b.body);
                const num = filtered.length - idx;
                idx++;
                return (
                  <Link key={b.slug} className="ar-post" href={`/building/${b.slug}`}>
                    <span className="idx">/{String(num).padStart(3, "0")}</span>
                    <span className="date">{b.date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      {img && <img src={img} alt={b.title} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />}
                      <div>
                        <div className="ttl">{b.title}</div>
                        <div className="dek">{b.dek && b.dek.length > 80 ? b.dek.slice(0, 80) + "…" : b.dek}</div>
                      </div>
                    </div>
                    <span className="tag" data-tag="BUILD">BUILD</span>
                    <span className="stat"></span>
                  </Link>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "#5e6770", border: "1px dashed rgba(255,255,255,0.18)" }}>// no builds yet</div>
          )}
        </div>
      </div>

      <footer className="ar-foot">
        <div>© 2026 CHOI JUHWAN · <span>BUILDING ARCHIVE</span></div>
        <div>SET IN <span>SPACE GROTESK + JETBRAINS MONO</span></div>
      </footer>
    </div>
  );
}
