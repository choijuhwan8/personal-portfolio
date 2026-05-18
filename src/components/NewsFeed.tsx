"use client";
import { useEffect, useState } from "react";
import { getNews, NewsItem } from "@/lib/news";
import Link from "next/link";

const CAT_COLORS: Record<string, string> = {
  DEFI: "#00e5ff", INFRASTRUCTURE: "#00e5ff", REGULATION: "#ff6b35",
  MARKETS: "#ff4dd2", MACRO: "#ff4dd2", NFT: "#a78bfa",
};

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `v3_news_${today}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed.slice(0, 6));
          setLastUpdated(parsed[0]?.date || today);
          return;
        }
      }
    } catch {}
    getNews(6).then((all) => {
      const fresh = all.filter((i) => i.category).slice(0, 6);
      setItems(fresh);
      setLastUpdated(fresh[0]?.date || today);
    });
  }, []);

  return (
    <div className="spec news-feed" style={{ marginTop: 8 }}>
      <div className="spec-head">
        <span>// DAILY AI NEWS</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && <span style={{ color: "var(--dim)", fontSize: 9, letterSpacing: "0.12em" }}>UPDATED {lastUpdated}</span>}
          <Link href="/news" style={{ color: "var(--cyan)", textDecoration: "none", fontSize: 10, letterSpacing: "0.16em" }}>ALL ↗</Link>
        </span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "12px 14px", fontSize: 11, color: "var(--dim)", letterSpacing: "0.14em" }}>LOADING...</div>
      ) : (
        items.map((item, i) => (
          <a
            key={item.id}
            href={item.url || "#"}
            target={item.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="news-feed-row"
          >
            <span className="nf-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="nf-cat" style={{ color: CAT_COLORS[item.category] || "var(--dim)" }}>{item.category}</span>
            <span className="nf-title">{item.title}</span>
            <span className="nf-sig">{item.significance}</span>
          </a>
        ))
      )}
    </div>
  );
}
