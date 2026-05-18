"use client";
import { useEffect, useState } from "react";

const SEEDS = [
  { sym: "BTC", base: 71240 }, { sym: "ETH", base: 3812.4 },
  { sym: "SOL", base: 174.3 }, { sym: "STETH", base: 3804.1 },
  { sym: "EZETH", base: 3780.6 }, { sym: "TIA", base: 8.42 },
  { sym: "ARB", base: 1.13 }, { sym: "OP", base: 2.41 },
  { sym: "PYTH", base: 0.412 }, { sym: "BLAST", base: 0.028 },
  { sym: "ENA", base: 0.731 }, { sym: "JUP", base: 1.18 },
];

function fmt(price: number) {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 10) return price.toFixed(2);
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(4);
}

export default function Ticker() {
  const [tick, setTick] = useState(() =>
    SEEDS.map((s) => ({ ...s, price: s.base, delta: 0 }))
  );

  useEffect(() => {
    // seed initial deltas client-side only to avoid hydration mismatch
    setTick((prev) =>
      prev.map((p) => ({ ...p, delta: (Math.random() - 0.5) * 4 }))
    );

    const id = setInterval(() => {
      setTick((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * 0.012;
          const next = Math.max(0.000001, p.price * (1 + drift));
          return { ...p, price: next, delta: ((next - p.base) / p.base) * 100 };
        })
      );
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const items = [...tick, ...tick];
  return (
    <div className="ticker-row">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-sym">{t.sym}</span>
            <span className="ticker-px">${fmt(t.price)}</span>
            <span className={`ticker-d ${t.delta >= 0 ? "up" : "dn"}`}>
              {t.delta >= 0 ? "+" : ""}{t.delta.toFixed(2)}%
            </span>
            <span className="ticker-sep">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
