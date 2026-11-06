"use client";
import { useMemo } from "react";

/** Deterministic, upward-drifting random walk — a quiet nod to markets, drawn on load. */
function series(n: number, seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const pts: number[] = [];
  let v = 40;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.43) * 7 + Math.sin(i / 9) * 0.8;
    pts.push(v);
  }
  return pts;
}

export default function HeroChart() {
  const W = 640;
  const H = 360;
  const { line, area, last } = useMemo(() => {
    const raw = series(90, 7);
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const xy = raw.map((v, i) => [
      (i / (raw.length - 1)) * (W - 16),
      H - 24 - ((v - min) / (max - min)) * (H - 72),
    ]);
    // Smooth with Catmull-Rom → Bézier
    let d = `M${xy[0][0]},${xy[0][1]}`;
    for (let i = 0; i < xy.length - 1; i++) {
      const p0 = xy[i - 1] || xy[i];
      const p1 = xy[i];
      const p2 = xy[i + 1];
      const p3 = xy[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return { line: d, area: `${d} L${xy[xy.length - 1][0]},${H} L0,${H} Z`, last: xy[xy.length - 1] };
  }, []);

  return (
    <svg className="hero-chart" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="hc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="hc-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.15 }} />
          <stop offset="70%" style={{ stopColor: "var(--accent)", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="hc-grid" />
      ))}
      <path d={area} fill="url(#hc-fill)" className="hc-area" />
      <path d={line} fill="none" stroke="url(#hc-stroke)" strokeWidth="2" className="hc-line" pathLength={1} />
      <circle cx={last[0]} cy={last[1]} r="10" className="hc-pulse" />
      <circle cx={last[0]} cy={last[1]} r="4" className="hc-dot" />
    </svg>
  );
}
