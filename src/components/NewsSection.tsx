"use client";
import { useState, useEffect } from "react";
import { getNews, NewsItem } from "@/lib/news";

const ACCENT_MAP: Record<string, string> = {
  DEFI: "#00e5ff", INFRASTRUCTURE: "#00e5ff", REGULATION: "#ff6b35",
  MARKETS: "#ff4dd2", MACRO: "#ff4dd2", NFT: "#a78bfa",
};

function getAccent(category: string) {
  return ACCENT_MAP[category] || "#00e5ff";
}

function AbstractImage({ idx, accent }: { idx: number; accent: string }) {
  const id = `np${idx}`;
  const bg = "#0a0b0d";
  const p = idx % 6;

  if (p === 0) {
    const points = Array.from({ length: 5 }, (_, i) => {
      const amp = 8 + i * 11;
      return Array.from({ length: 101 }, (_, j) => `${j * 4},${100 + Math.sin(j * 0.11 + i * 1.2) * amp}`).join(" ");
    });
    return (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill={bg} />
        {points.map((pts, i) => <polyline key={i} points={pts} fill="none" stroke={accent} strokeWidth="1.2" strokeOpacity={0.07 + i * 0.09} />)}
        <defs><radialGradient id={`rg${id}`} cx="30%" cy="55%" r="65%"><stop offset="0%" stopColor={accent} stopOpacity="0.18" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></radialGradient></defs>
        <rect width="400" height="200" fill={`url(#rg${id})`} />
      </svg>
    );
  }

  if (p === 1) {
    const ROWS = 7, COLS = 15;
    return (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill={bg} />
        {Array.from({ length: ROWS * COLS }, (_, k) => {
          const row = Math.floor(k / COLS), col = k % COLS;
          const lit = (row * 5 + col * 7 + row * col) % 13 < 4;
          return <circle key={k} cx={14 + col * 26} cy={16 + row * 26} r={lit ? 3.5 : 1.5} fill={accent} opacity={lit ? 0.65 : 0.1} />;
        })}
        <defs><radialGradient id={`rg${id}`} cx="75%" cy="25%" r="55%"><stop offset="0%" stopColor={accent} stopOpacity="0.14" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></radialGradient></defs>
        <rect width="400" height="200" fill={`url(#rg${id})`} />
      </svg>
    );
  }

  if (p === 2) {
    const bars = [38, 72, 55, 88, 61, 79, 44, 93, 50, 82, 67, 40, 85, 58, 76, 35];
    return (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill={bg} />
        <line x1="0" y1="170" x2="400" y2="170" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
        {bars.map((h, i) => <rect key={i} x={10 + i * 24} y={170 - h * 1.55} width={17} height={h * 1.55} fill={accent} opacity={i === 7 ? 0.75 : 0.08 + (i / bars.length) * 0.4} />)}
        <defs><linearGradient id={`lg${id}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={accent} stopOpacity="0.08" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
        <rect width="400" height="200" fill={`url(#lg${id})`} />
      </svg>
    );
  }

  if (p === 3) {
    const nodes: [number, number][] = [[200,100],[75,55],[325,55],[75,145],[325,145],[155,42],[245,42],[128,100],[272,100],[200,165]];
    const edges: [number, number][] = [[0,1],[0,2],[0,3],[0,4],[1,5],[2,6],[3,7],[4,8],[5,6],[7,8],[0,9],[1,3],[2,4],[5,7],[6,8]];
    return (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill={bg} />
        {edges.map(([a, b], i) => <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={accent} strokeWidth="1" strokeOpacity="0.22" />)}
        {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 0 ? 9 : 4} fill={accent} opacity={i === 0 ? 0.85 : 0.38} />)}
        <defs><radialGradient id={`rg${id}`} cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor={accent} stopOpacity="0.13" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></radialGradient></defs>
        <rect width="400" height="200" fill={`url(#rg${id})`} />
      </svg>
    );
  }

  if (p === 4) {
    const N = 36;
    return (
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill={bg} />
        {Array.from({ length: N }, (_, i) => {
          const angle = (i / N) * Math.PI * 2;
          return <line key={i} x1="200" y1="100" x2={200 + Math.cos(angle) * 190} y2={100 + Math.sin(angle) * 190} stroke={accent} strokeWidth="1" strokeOpacity={i % 3 === 0 ? 0.28 : 0.06} />;
        })}
        {[16, 50, 90, 140].map((r, i) => <circle key={i} cx="200" cy="100" r={r} fill="none" stroke={accent} strokeWidth={i === 0 ? 1.5 : 0.5} strokeOpacity={0.35 - i * 0.06} />)}
        <circle cx="200" cy="100" r="6" fill={accent} opacity="0.9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill={bg} />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x="0" y={i * 10} width="400" height="1" fill={accent} opacity={i % 4 === 0 ? 0.14 : 0.04} />)}
      {[55, 130, 200, 270, 345].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="0" x2={x} y2="200" stroke={accent} strokeWidth="1" strokeOpacity="0.18" />
          <circle cx={x} cy={35 + i * 30} r="4" fill={accent} opacity="0.55" />
          <circle cx={x} cy={35 + i * 30} r="9" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.28" />
        </g>
      ))}
      <defs><linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={accent} stopOpacity="0.14" /><stop offset="45%" stopColor={accent} stopOpacity="0.03" /><stop offset="100%" stopColor={accent} stopOpacity="0.14" /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#lg${id})`} />
    </svg>
  );
}

function NewsCard({ item, idx }: { item: NewsItem; idx: number }) {
  const accent = getAccent(item.category);
  return (
    <a className="v3-news-card" href={item.url} target="_blank" rel="noopener noreferrer">
      <div className="v3-news-img">
        <AbstractImage idx={idx} accent={accent} />
        <div className="v3-news-source-badge" style={{ background: accent }}>{item.source}</div>
      </div>
      <div className="v3-news-body">
        <div className="v3-news-meta">
          {item.category && <span className="v3-news-tag" style={{ color: accent, borderColor: accent }}>{item.category}</span>}
          <span className="v3-news-date">{item.date}</span>
        </div>
        <div className="v3-news-title">{item.title}</div>
        <div className="v3-news-summary">{item.summary}</div>
        {item.url && <div className="v3-news-read">READ ↗</div>}
      </div>
    </a>
  );
}

export default function NewsSection() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `v3_news_${today}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {}

    getNews(10)
      .then((all) => {
        const fresh = all.filter((i) => i.category).slice(0, 6);
        setItems(fresh);
        try { localStorage.setItem(cacheKey, JSON.stringify(fresh)); } catch {}
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading ? (
        <div className="v3-news-loading">FETCHING TODAY&apos;S BRIEFING...</div>
      ) : (
        <section className="v3-news-grid">
          {items.map((item, i) => <NewsCard key={item.id} item={item} idx={i} />)}
        </section>
      )}
    </>
  );
}
