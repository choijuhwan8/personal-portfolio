import Link from "next/link";
import { PORTFOLIO_DATA as D } from "@/lib/data";

export default function SiteFooter({ visitors }: { visitors?: { today: number; total: number } }) {
  return (
    <footer className="site-foot">
      <div className="wrap foot-inner">
        <div className="foot-brand">
          <span className="wordmark">
            Juhwan <em>Choi</em>
          </span>
          <span className="muted">{D.location}</span>
        </div>
        <ul className="foot-links">
          {D.socials.map((s) => (
            <li key={s.label}>
              <a href={s.url} target={s.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="foot-meta">
          <span>© {new Date().getFullYear()} Juhwan Choi</span>
          {visitors && visitors.total > 0 && (
            <span>
              {visitors.total.toLocaleString()} visits
            </span>
          )}
          <Link href="/admin" className="foot-admin" aria-label="Admin">
            ·
          </Link>
        </div>
      </div>
    </footer>
  );
}
