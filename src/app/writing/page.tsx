"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPosts, byDateThenTime, type Post } from "@/lib/posts";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const TAGS = [
  { id: "ALL", label: "All" },
  { id: "OPINION", label: "Opinion" },
  { id: "STUDY", label: "Study notes" },
];
const tagLabel = (t: string) => (t === "RESEARCH" || t === "OPINION" ? "Opinion" : t === "STUDY" ? "Study notes" : t);

export default function WritingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tag, setTag] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .finally(() => setLoaded(true));
  }, []);

  const filtered = posts
    .filter((p) => tag === "ALL" || p.tag === tag || (tag === "OPINION" && p.tag === "RESEARCH"))
    .filter((p) => !search || `${p.title} ${p.dek}`.toLowerCase().includes(search.toLowerCase()))
    .sort(byDateThenTime);

  const byYear: Record<string, Post[]> = {};
  for (const p of filtered) (byYear[(p.date || "").slice(0, 4)] ||= []).push(p);
  const years = Object.keys(byYear).sort().reverse();

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
              <em>Writing</em>
            </h1>
          </div>
          <p>Notes and opinions on markets, finance and the businesses I'm studying.</p>
        </section>

        <div className="filters">
          {TAGS.map((t) => (
            <button key={t.id} type="button" className={tag === t.id ? "active" : ""} onClick={() => setTag(t.id)}>
              {t.label}
            </button>
          ))}
          <input type="search" placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {years.map((y) => (
          <div key={y}>
            <div className="year-h">
              {y}
              <span>{byYear[y].length} posts</span>
            </div>
            {byYear[y].map((p) => (
              <Link key={p.slug} href={`/writing/${p.slug}`} className="arc-row">
                <span className="mono muted">{p.date}</span>
                <div>
                  <div className="t">{p.title}</div>
                  {p.dek && <div className="d">{p.dek}</div>}
                </div>
                <span className="chip">{tagLabel(p.tag)}</span>
              </Link>
            ))}
          </div>
        ))}
        {loaded && filtered.length === 0 && (
          <div className="empty">{posts.length === 0 ? "New writing is on the way." : "No posts match your search."}</div>
        )}
      </main>
      <div style={{ height: 120 }} />
      <SiteFooter />
    </div>
  );
}
