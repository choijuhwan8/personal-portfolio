"use client";
import { useState } from "react";
import { NewsItem } from "@/lib/news";

const CAT_COLORS: Record<string, string> = {
  MARKETS: "#aaff00",
  DEFI: "#00e5ff",
  REGULATION: "#ff4dd2",
  INFRASTRUCTURE: "#a78bfa",
  NFT: "#f59e0b",
  MACRO: "#5e6770",
};

export default function NewsSlider({ items, coverImage }: { items: NewsItem[]; coverImage: string }) {
  const [active, setActive] = useState(0);

  if (items.length === 0) return (
    <div style={{ padding: "48px 32px", color: "var(--dim)", fontSize: 12, letterSpacing: "0.16em" }}>
      NO ITEMS YET. FEED INCOMING.
    </div>
  );

  const item = items[active];

  return (
    <div className="news-slider">
      <div className="ns-right">
        {/* card */}
        <div className="ns-card">
          <div className="ns-card-top">
            {item.category && (
              <span className="ns-cat" style={{ color: CAT_COLORS[item.category] || "var(--dim)", borderColor: CAT_COLORS[item.category] || "var(--dim)" }}>
                {item.category}
              </span>
            )}
            <span className="ns-src">{item.source}</span>
          </div>
          <div className="ns-title">{item.title}</div>
          <div className="ns-summary">{item.summary}</div>
          {item.body && <div className="ns-body">{item.body.replace(/<cite[^>]*>|<\/cite>/g, "")}</div>}
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="ns-read">
            READ SOURCE ↗
          </a>
        </div>

        {/* prev / next */}
        <div className="ns-nav">
          <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>← PREV</button>
          <div className="ns-dots">
            {items.map((_, i) => (
              <button key={i} className={`ns-dot${active === i ? " active" : ""}`} onClick={() => setActive(i)} />
            ))}
          </div>
          <button onClick={() => setActive((a) => Math.min(items.length - 1, a + 1))} disabled={active === items.length - 1}>NEXT →</button>
        </div>
      </div>
    </div>
  );
}
