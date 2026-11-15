"use client";
import { PORTFOLIO_DATA as D } from "@/lib/data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Aug 2025" → months since year 0; "Present" → the current month. */
function toMonth(s: string, now: Date) {
  const t = s.trim();
  if (/present/i.test(t)) return now.getFullYear() * 12 + now.getMonth();
  const [m, y] = t.split(/\s+/);
  return Number(y) * 12 + MONTHS.indexOf(m);
}

/** Every role from the experience record, drawn on one shared time axis. */
export default function HeroChart() {
  const now = new Date();
  const rows = D.experience.map((e) => {
    const [from, to] = e.period.split("—");
    return {
      key: e.org,
      label: e.short ?? e.org,
      period: e.period,
      kind: /present/i.test(to) ? "now" : e.kind,
      start: toMonth(from, now),
      end: toMonth(to, now) + 1,
    };
  });
  const first = Math.floor(Math.min(...rows.map((r) => r.start)) / 12) * 12;
  const last = (Math.floor(Math.max(...rows.map((r) => r.end - 1)) / 12) + 1) * 12;
  const span = last - first;
  const years = Array.from({ length: span / 12 }, (_, i) => first / 12 + i);

  return (
    <figure className="xp-chart" style={{ "--cols": years.length } as React.CSSProperties}>
      {rows.map((r) => (
        <div className="xp-row" key={r.key}>
          <span className={`xp-label${r.kind === "now" ? " is-now" : ""}`}>{r.label}</span>
          <span className="xp-track">
            <i
              className={`xp-bar xp-${r.kind}`}
              title={`${r.label}: ${r.period}`}
              style={{ left: `${((r.start - first) / span) * 100}%`, width: `${((r.end - r.start) / span) * 100}%` }}
            />
          </span>
        </div>
      ))}
      <div className="xp-row xp-axis" aria-hidden="true">
        <span />
        <span className="xp-years">
          {years.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </span>
      </div>
    </figure>
  );
}
