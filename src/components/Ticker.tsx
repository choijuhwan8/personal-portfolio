"use client";
import { useEffect, useState } from "react";

const SYMBOLS = [
  { sym: "BTC",   id: "bitcoin" },
  { sym: "ETH",   id: "ethereum" },
  { sym: "SOL",   id: "solana" },
  { sym: "STETH", id: "staked-ether" },
  { sym: "EZETH", id: "renzo-restaked-eth" },
  { sym: "TIA",   id: "celestia" },
  { sym: "ARB",   id: "arbitrum" },
  { sym: "OP",    id: "optimism" },
  { sym: "PYTH",  id: "pyth-network" },
  { sym: "BLAST", id: "blast" },
  { sym: "ENA",   id: "ethena" },
  { sym: "JUP",   id: "jupiter" },
];

type TickItem = { sym: string; price: number; delta: number };

function fmt(price: number) {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 10) return price.toFixed(2);
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(4);
}

async function fetchPrices(): Promise<TickItem[]> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return SYMBOLS.map(({ sym, id }) => ({
    sym,
    price: data[id]?.usd ?? 0,
    delta: data[id]?.usd_24h_change ?? 0,
  })).filter((t) => t.price > 0);
}

export default function Ticker() {
  const [tick, setTick] = useState<TickItem[]>([]);

  useEffect(() => {
    // initial fetch
    fetchPrices().then(setTick).catch(() => {});

    // refresh every 30s
    const id = setInterval(() => {
      fetchPrices().then(setTick).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (tick.length === 0) return null;

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
