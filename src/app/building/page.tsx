"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBuilds, extractFirstImage, type Build } from "@/lib/builds";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function BuildingPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getBuilds()
      .then(setBuilds)
      .finally(() => setLoaded(true));
  }, []);

  const filtered = builds.filter((b) => !search || `${b.title} ${b.dek}`.toLowerCase().includes(search.toLowerCase()));

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
              <em>Projects</em>
            </h1>
          </div>
          <p>Events, products and initiatives I've led or built.</p>
        </section>

        <div className="filters">
          <input type="search" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="cards" style={{ marginTop: 32 }}>
          {filtered.map((b) => {
            const img = extractFirstImage(b.body);
            return (
              <Link key={b.slug} href={`/building/${b.slug}`} className="card">
                <div className="card-media">
                  {img ? <img src={img} alt="" loading="lazy" /> : <span className="card-mono">{b.title.slice(0, 1)}</span>}
                </div>
                <div className="card-body">
                  <span className="card-meta">{b.date}</span>
                  <h3>{b.title}</h3>
                  {b.dek && <p>{b.dek}</p>}
                  <span className="card-link">Read more →</span>
                </div>
              </Link>
            );
          })}
        </div>
        {loaded && filtered.length === 0 && <div className="empty">No projects match your search.</div>}
      </main>
      <div style={{ height: 120 }} />
      <SiteFooter />
    </div>
  );
}
