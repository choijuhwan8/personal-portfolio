"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getNews, type NewsItem } from "@/lib/news";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const CATS = ["ALL", "EQUITIES", "RATES", "FX", "COMMODITIES", "MACRO", "POLICY"];
const label = (c: string) => (c === "ALL" ? "All" : c.charAt(0) + c.slice(1).toLowerCase());

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getNews(300)
      .then(setItems)
      .finally(() => setLoaded(true));
  }, []);

  const filtered = items
    .filter((i) => cat === "ALL" || i.category === cat)
    .filter((i) => !search || `${i.title} ${i.summary} ${i.body}`.toLowerCase().includes(search.toLowerCase()));

  const byDate: Record<string, NewsItem[]> = {};
  for (const i of filtered) (byDate[i.date || ""] ||= []).push(i);
  const dates = Object.keys(byDate).sort().reverse();

  return (
    <div className="site">
      <SiteNav />
      <main className="wrap">
        <section className="page-hero">
          <div>
            <Link href="/" className="back-link">
              ← Home
            </Link>
            <h1>
              Markets <em>brief</em>
            </h1>
          </div>
          <p>A daily selection of market-moving stories across equities, rates, FX and macro, summarised with AI.</p>
        </section>

        <div className="filters">
          {CATS.map((c) => (
            <button key={c} type="button" className={cat === c ? "active" : ""} onClick={() => setCat(c)}>
              {label(c)}
            </button>
          ))}
          <input type="search" placeholder="Search headlines…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {dates.map((d) => (
          <div key={d}>
            <div className="year-h">
              {d}
              <span>{byDate[d].length} stories</span>
            </div>
            {byDate[d].map((item) => {
              const open = expanded === item.id;
              return (
                <div key={item.id} className="news-card" onClick={() => setExpanded(open ? null : item.id)}>
                  <div className="news-head">
                    <div>
                      {item.category && <span className="cat">{item.category}</span>}
                      <div className="t">{item.title}</div>
                      <div className="s">{item.summary}</div>
                    </div>
                    <div className="r">
                      <span>{item.source}</span>
                      <span className="toggle">{open ? "−" : "+"}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="news-body">
                      <p>{item.body}</p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          Read at {item.source} ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {loaded && filtered.length === 0 && <div className="empty">The first brief will appear after the next daily update.</div>}
      </main>
      <div style={{ height: 120 }} />
      <SiteFooter />
    </div>
  );
}
