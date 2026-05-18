// Shared UI primitives: live ticker, animated grid, hooks
const { useEffect, useState, useRef, useMemo } = React;

// ---- live crypto-style ticker (fake but plausible random-walks) ----
const TICKER_SEEDS = [
  { sym: "BTC",  base: 71240,  digits: 0  },
  { sym: "ETH",  base: 3812.4, digits: 2  },
  { sym: "SOL",  base: 174.3,  digits: 2  },
  { sym: "STETH",base: 3804.1, digits: 2  },
  { sym: "EZETH",base: 3780.6, digits: 2  },
  { sym: "TIA",  base: 8.42,   digits: 3  },
  { sym: "ARB",  base: 1.13,   digits: 4  },
  { sym: "OP",   base: 2.41,   digits: 3  },
  { sym: "PYTH", base: 0.412,  digits: 4  },
  { sym: "BLAST",base: 0.028,  digits: 5  },
  { sym: "ENA",  base: 0.731,  digits: 4  },
  { sym: "JUP",  base: 1.18,   digits: 4  },
];

function useTicker(speed = 1600) {
  const [tick, setTick] = useState(() =>
    TICKER_SEEDS.map(s => ({
      ...s,
      price: s.base,
      delta: (Math.random() - 0.5) * 4,
    }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTick(prev => prev.map(p => {
        const drift = (Math.random() - 0.5) * 0.012;
        const next = Math.max(0.000001, p.price * (1 + drift));
        const delta = ((next - p.base) / p.base) * 100;
        return { ...p, price: next, delta };
      }));
    }, speed);
    return () => clearInterval(id);
  }, [speed]);
  return tick;
}

function fmtPrice(p) {
  if (p.price >= 1000) return p.price.toFixed(0);
  if (p.price >= 10)   return p.price.toFixed(2);
  if (p.price >= 1)    return p.price.toFixed(3);
  return p.price.toFixed(4);
}

// Ticker row (style varies per variation through className)
function Ticker({ className = "", sep = "•", accent = "lime" }) {
  const tick = useTicker();
  return (
    <div className={`ticker-row ${className}`} data-accent={accent}>
      <div className="ticker-track">
        {[...tick, ...tick].map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-sym">{t.sym}</span>
            <span className="ticker-px">${fmtPrice(t)}</span>
            <span className={`ticker-d ${t.delta >= 0 ? "up" : "dn"}`}>
              {t.delta >= 0 ? "+" : ""}{t.delta.toFixed(2)}%
            </span>
            <span className="ticker-sep">{sep}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- FUTURISTIC grid background (canvas) ----
// Layers: faint full-page grid + animated perspective floor/ceiling +
// scanning horizon line + cursor-following glow + slow drifting accent dots.
function FuturisticGrid({
  color = "#00e5ff",
  accent = "#ff4dd2",
  density = 60,
}) {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5, has: false });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf, t0 = performance.now();
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = c.getBoundingClientRect();
      c.width = width * dpr; c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const onMove = (e) => {
      const r = c.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        has: true,
      };
    };
    window.addEventListener("mousemove", onMove);

    const draw = (now) => {
      const t = (now - t0) / 1000;
      const { width, height } = c.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      // --- 1. faint base grid
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const step = density;
      for (let i = 0; i <= Math.ceil(width / step); i++) {
        ctx.globalAlpha = 0.04;
        const x = i * step;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let j = 0; j <= Math.ceil(height / step); j++) {
        ctx.globalAlpha = 0.04;
        const y = j * step;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // --- 2. perspective floor (lower half)
      const horizon = height * 0.62;
      const floorH = height - horizon;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizon, width, floorH);
      ctx.clip();

      // floor verticals
      const vanishX = width / 2;
      const vCount = 18;
      for (let i = -vCount; i <= vCount; i++) {
        const offset = (i / vCount) * width * 0.9;
        const xTop = vanishX + offset * 0.02;
        const xBot = vanishX + offset;
        ctx.globalAlpha = 0.18 - Math.abs(i) / vCount * 0.12;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xTop, horizon);
        ctx.lineTo(xBot, height);
        ctx.stroke();
      }

      // floor horizontals (STATIC — no animation, much calmer)
      const rows = 10;
      for (let i = 1; i < rows; i++) {
        const u = i / rows;
        const y = horizon + Math.pow(u, 2.2) * floorH;
        ctx.globalAlpha = 0.10 * (1 - u) + 0.03;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // --- 3. mirrored ceiling (upper) — subtle
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, horizon * 0.55);
      ctx.clip();
      const ceilH = horizon * 0.55;
      for (let i = -vCount; i <= vCount; i++) {
        const offset = (i / vCount) * width * 0.9;
        const xBot = vanishX + offset * 0.02;
        const xTop = vanishX + offset;
        ctx.globalAlpha = 0.08 - Math.abs(i) / vCount * 0.05;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(xTop, 0);
        ctx.lineTo(xBot, ceilH);
        ctx.stroke();
      }
      ctx.restore();

      // --- 6. accent dots at grid crossings (gentle twinkle, slower)
      const cols = Math.ceil(width / step);
      const rowsG = Math.ceil(height / step);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rowsG; j++) {
          if ((i * 7 + j * 11) % 31 !== 0) continue;
          const twink = (Math.sin((i + j) * 0.5 + t * 0.6) * 0.5 + 0.5);
          if (twink < 0.5) continue;
          ctx.globalAlpha = (twink - 0.5) * 0.9;
          ctx.fillStyle = (i + j) % 9 === 0 ? accent : color;
          const x = i * step, y = j * step;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // --- 7. cursor glow
      if (mouse.current.has) {
        const mx = mouse.current.x * width;
        const my = mouse.current.y * height;
        const rg = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        rg.addColorStop(0, "rgba(0,229,255,0.18)");
        rg.addColorStop(1, "rgba(0,229,255,0)");
        ctx.fillStyle = rg;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 8. corner brackets (static)
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const b = 16, pad = 12;
      [[pad,pad,1,1],[width-pad,pad,-1,1],[pad,height-pad,1,-1],[width-pad,height-pad,-1,-1]].forEach(([x,y,sx,sy]) => {
        ctx.beginPath();
        ctx.moveTo(x + b*sx, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + b*sy);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [color, accent, density]);
  return <canvas ref={ref} className="grid-bg futuristic" />;
}

// ---- animated grid background (canvas) ----
function GridBG({ color = "#00ff88", density = 48, pulse = true, dotMode = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf, t0 = performance.now();
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = c.getBoundingClientRect();
      c.width = width * dpr; c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const draw = (now) => {
      const t = (now - t0) / 1000;
      const { width, height } = c.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      const step = density;
      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 1;
      if (dotMode) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * step;
            const y = j * step;
            const pulseV = pulse ? (Math.sin((i + j) * 0.4 + t * 0.8) * 0.5 + 0.5) : 1;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.06 + pulseV * 0.14;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let i = 0; i < cols; i++) {
          const x = i * step;
          const a = pulse ? (Math.sin(i * 0.3 + t * 0.5) * 0.5 + 0.5) : 1;
          ctx.globalAlpha = 0.04 + a * 0.05;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let j = 0; j < rows; j++) {
          const y = j * step;
          const a = pulse ? (Math.sin(j * 0.3 + t * 0.4 + 1.2) * 0.5 + 0.5) : 1;
          ctx.globalAlpha = 0.04 + a * 0.05;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [color, density, pulse, dotMode]);
  return <canvas ref={ref} className="grid-bg" />;
}

// Clock / system time
function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}
function fmtClock(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth()+1)}.${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

// Block height fake counter — increments roughly every 12s
function useBlockHeight(start = 22_481_204) {
  const [n, setN] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setN(v => v + 1), 12000);
    return () => clearInterval(id);
  }, []);
  return n;
}

Object.assign(window, {
  Ticker, GridBG, FuturisticGrid, useTicker, useClock, fmtClock, useBlockHeight, fmtPrice,
});
