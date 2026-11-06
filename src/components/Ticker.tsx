"use client";
import { useEffect, useState } from "react";

type Quote = { sym: string; label: string; kind: string; price: number; change: number };

function fmt(q: Quote) {
  if (q.kind === "yield") return `${q.price.toFixed(3)}%`;
  if (q.kind === "fx") return q.price >= 100 ? q.price.toFixed(2) : q.price.toFixed(4);
  return q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const load = () =>
      fetch("/api/markets")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.quotes?.length && setQuotes(d.quotes))
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ticker" aria-label="Market snapshot">
      <span className="ticker-tag">
        <span className="pulse" />
        Markets
      </span>
      <div className="ticker-viewport">
        {quotes.length === 0 ? (
          <span className="ticker-loading">Loading market data…</span>
        ) : (
          <div className="ticker-track">
            {[...quotes, ...quotes].map((q, i) => (
              <span key={i} className="ticker-item" aria-hidden={i >= quotes.length}>
                <span className="t-sym">{q.label}</span>
                <span className="t-px">{fmt(q)}</span>
                <span className={`t-chg ${q.change >= 0 ? "up" : "dn"}`}>
                  {q.change >= 0 ? "▲" : "▼"} {Math.abs(q.change).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
