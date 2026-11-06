"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PostBody from "./PostBody";

type Heading = { level: 1 | 2; text: string; id: string };

const slugify = (t: string) => t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");

function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  for (const line of body.split("\n")) {
    const m2 = line.match(/^##\s+(.+)$/);
    const m1 = !m2 && line.match(/^#\s+(.+)$/);
    if (m2) out.push({ level: 2, text: m2[1], id: slugify(m2[1]) });
    else if (m1) out.push({ level: 1, text: m1[1], id: slugify(m1[1]) });
  }
  return out;
}

function readTime(body: string) {
  return Math.max(1, Math.round((body.match(/\S+/g) || []).length / 220));
}

type Item = { slug: string; title: string; dek?: string; date: string; body: string; links?: { label: string; url: string }[] };

export default function ArticleView({
  item,
  tag,
  base,
  backLabel,
  prev,
  next,
}: {
  item: Item;
  tag: string;
  base: string;
  backLabel: string;
  prev: Item | null;
  next: Item | null;
}) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  const headings = extractHeadings(item.body || "");

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
      let current = "";
      for (const el of document.querySelectorAll(".prose h1[id], .prose h2[id]")) {
        if (el.getBoundingClientRect().top <= 150) current = el.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <div className="wrap article-wrap">
        <article className="article">
          <Link href={base} className="back-link">
            ← {backLabel}
          </Link>
          <div>
            <span className="chip article-tag">{tag}</span>
          </div>
          <h1 className="title">{item.title}</h1>
          {item.dek && <p className="dek">{item.dek}</p>}
          <div className="byline">
            <span>
              By <b>Juhwan Choi</b>
            </span>
            <span>
              Published <b>{item.date}</b>
            </span>
            <span>
              <b>{readTime(item.body || "")} min</b> read
            </span>
          </div>
          {item.links && item.links.length > 0 && (
            <div className="ext-links">
              {item.links.map((lk) => (
                <a key={lk.url} href={lk.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  {lk.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
          <PostBody body={item.body || ""} />

          <nav className="pager">
            {prev ? (
              <Link href={`${base}/${prev.slug}`}>
                <span className="l">← Previous</span>
                <span className="t">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`${base}/${next.slug}`} className="next">
                <span className="l">Next →</span>
                <span className="t">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <aside className="toc">
          {headings.length > 0 && (
            <>
              <h5>Contents</h5>
              <nav>
                {headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`} className={`${h.level === 2 ? "l2" : ""}${activeId === h.id ? " active" : ""}`}>
                    {h.text}
                  </a>
                ))}
              </nav>
            </>
          )}
          <div className="share">
            <h5>Share</h5>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on LinkedIn
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
