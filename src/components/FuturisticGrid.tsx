"use client";
import { useEffect, useRef } from "react";

export default function FuturisticGrid({ color = "#00e5ff", accent = "#ff4dd2", density = 60 }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, has: false });

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = c.getBoundingClientRect();
      c.width = width * dpr; c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, has: true };
    };
    window.addEventListener("mousemove", onMove);

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const { width, height } = c.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color; ctx.lineWidth = 1;

      for (let i = 0; i <= Math.ceil(width / density); i++) {
        ctx.globalAlpha = 0.04;
        ctx.beginPath(); ctx.moveTo(i * density, 0); ctx.lineTo(i * density, height); ctx.stroke();
      }
      for (let j = 0; j <= Math.ceil(height / density); j++) {
        ctx.globalAlpha = 0.04;
        ctx.beginPath(); ctx.moveTo(0, j * density); ctx.lineTo(width, j * density); ctx.stroke();
      }

      const horizon = height * 0.62, floorH = height - horizon;
      const vanishX = width / 2, vCount = 18;
      ctx.save(); ctx.beginPath(); ctx.rect(0, horizon, width, floorH); ctx.clip();
      for (let i = -vCount; i <= vCount; i++) {
        const off = (i / vCount) * width * 0.9;
        ctx.globalAlpha = 0.18 - (Math.abs(i) / vCount) * 0.12;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(vanishX + off * 0.02, horizon); ctx.lineTo(vanishX + off, height); ctx.stroke();
      }
      for (let i = 1; i < 10; i++) {
        const u = i / 10, y = horizon + Math.pow(u, 2.2) * floorH;
        ctx.globalAlpha = 0.10 * (1 - u) + 0.03;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      ctx.restore();

      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, width, horizon * 0.55); ctx.clip();
      for (let i = -vCount; i <= vCount; i++) {
        const off = (i / vCount) * width * 0.9;
        ctx.globalAlpha = 0.08 - (Math.abs(i) / vCount) * 0.05;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(vanishX + off, 0); ctx.lineTo(vanishX + off * 0.02, horizon * 0.55); ctx.stroke();
      }
      ctx.restore();

      const cols = Math.ceil(width / density), rows = Math.ceil(height / density);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if ((i * 7 + j * 11) % 31 !== 0) continue;
          const tw = Math.sin((i + j) * 0.5 + t * 0.6) * 0.5 + 0.5;
          if (tw < 0.5) continue;
          ctx.globalAlpha = (tw - 0.5) * 0.9;
          ctx.fillStyle = (i + j) % 9 === 0 ? accent : color;
          ctx.fillRect(i * density - 1, j * density - 1, 2, 2);
        }
      }

      if (mouse.current.has) {
        const mx = mouse.current.x * width, my = mouse.current.y * height;
        const rg = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        rg.addColorStop(0, "rgba(0,229,255,0.18)"); rg.addColorStop(1, "rgba(0,229,255,0)");
        ctx.fillStyle = rg; ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("mousemove", onMove); };
  }, [color, accent, density]);

  return <canvas ref={ref} className="grid-bg futuristic" />;
}
