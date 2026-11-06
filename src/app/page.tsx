"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPosts, type Post } from "@/lib/posts";
import { getBuilds, extractFirstImage, type Build } from "@/lib/builds";
import { getNews, type NewsItem } from "@/lib/news";
import { PORTFOLIO_DATA as D } from "@/lib/data";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroChart from "@/components/HeroChart";
import { CountUp, Reveal } from "@/components/Reveal";

function useVisitors() {
  const [visitors, setVisitors] = useState({ today: 0, total: 0 });
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `visited_${today}`;
    let counted = false;
    try {
      counted = !!sessionStorage.getItem(key);
      if (!counted) sessionStorage.setItem(key, "1");
    } catch {}
    const totalRef = doc(db, "meta", "visitors");
    const todayRef = doc(db, "meta", `visitors_${today}`);
    (async () => {
      try {
        if (!counted) {
          await Promise.all([
            setDoc(totalRef, { total: increment(1) }, { merge: true }),
            setDoc(todayRef, { count: increment(1), date: today }, { merge: true }),
          ]);
        }
        const [t, d] = await Promise.all([getDoc(totalRef), getDoc(todayRef)]);
        setVisitors({ total: t.data()?.total ?? 0, today: d.data()?.count ?? 0 });
      } catch {}
    })();
  }, []);
  return visitors;
}

function SectionHead({ n, kicker, title }: { n: string; kicker: string; title: React.ReactNode }) {
  return (
    <Reveal className="sec-head">
      <span className="kicker">
        <span className="kicker-n">{n}</span>
        {kicker}
      </span>
      <h2>{title}</h2>
    </Reveal>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const visitors = useVisitors();

  useEffect(() => {
    getPosts().then(setPosts).catch(() => {});
    getBuilds().then(setBuilds).catch(() => {});
    getNews(5).then(setNews).catch(() => {});
  }, []);

  return (
    <div className="site">
      <SiteNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow rise" style={{ animationDelay: "60ms" }}>
              <span className="live-dot" />
              {D.availability}
            </span>
            <h1 className="rise" style={{ animationDelay: "140ms" }}>
              Clear thinking
              <br />
              for <em>complex</em> markets.
            </h1>
            <p className="lede rise" style={{ animationDelay: "240ms" }}>
              I'm Juhwan, an Information Systems student at SMU. I've worked in{" "}
              <strong>equity capital markets</strong>, <strong>venture building</strong> and{" "}
              <strong>technology</strong>, and I'm looking for client-facing roles in financial
              services.
            </p>
            <div className="hero-cta rise" style={{ animationDelay: "340ms" }}>
              <a href="#contact" className="btn">
                Get in touch <span aria-hidden="true">→</span>
              </a>
              <a href="#experience" className="btn btn-ghost">
                View experience
              </a>
            </div>
          </div>

          <div className="hero-card rise" style={{ animationDelay: "300ms" }}>
            <div className="hc-head">
              <span>Profile</span>
              <span className="mono">JC · 2027</span>
            </div>
            <div className="hc-chart">
              <HeroChart />
            </div>
            <dl className="hc-sheet">
              <div>
                <dt>Education</dt>
                <dd>SMU · BSc Information Systems</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Client coverage · Capital markets · Strategy</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>Korean · English · Mandarin (beginner)</dd>
              </div>
              <div>
                <dt>Based</dt>
                <dd>{D.location}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="stats">
          <div className="wrap stats-grid">
            {D.stats.map((s, i) => (
              <Reveal key={s.label} className="stat" delay={i * 80}>
                <span className="stat-v">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </span>
                <span className="stat-l">{s.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── About ────────────────────────────────────────── */}
        <section id="about" className="section wrap">
          <SectionHead n="01" kicker="About" title={<>Where analysis meets <em>relationships</em>.</>} />
          <div className="about-grid">
            <Reveal className="about-statement">
              <p>{D.intro}</p>
            </Reveal>
            <div className="pillars">
              {D.pillars.map((p, i) => (
                <Reveal key={p.n} className="pillar" delay={i * 90}>
                  <span className="pillar-n">{p.n}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Experience ───────────────────────────────────── */}
        <section id="experience" className="section wrap">
          <SectionHead n="02" kicker="Experience" title={<>A track record across <em>finance</em>, venture &amp; tech.</>} />
          <ol className="timeline">
            {D.experience.map((e, i) => (
              <Reveal as="li" key={e.org} className="tl-row" delay={i * 60}>
                <div className="tl-when">
                  <span>{e.period}</span>
                  <span className="muted">{e.location}</span>
                </div>
                <div className="tl-body">
                  <div className="tl-title">
                    <h3>{e.org}</h3>
                    {e.kind !== "work" && <span className="chip">{e.kind === "leadership" ? "Leadership" : "National service"}</span>}
                  </div>
                  <p className="tl-role">{e.role}</p>
                  <ul>
                    {e.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="creds">
            <Reveal className="cred">
              <h4>Education</h4>
              {D.education.map((ed) => (
                <div key={ed.school} className="cred-item">
                  <strong>{ed.school}</strong>
                  <span>{ed.detail}</span>
                  <span className="muted">{ed.period}</span>
                </div>
              ))}
            </Reveal>
            <Reveal className="cred" delay={90}>
              <h4>Languages</h4>
              {D.languages.map((l) => (
                <div key={l.name} className="lang">
                  <span>{l.name}</span>
                  <span className={`lang-bar lv-${l.level.toLowerCase()}`}>
                    <i />
                  </span>
                  <span className="muted">{l.level}</span>
                </div>
              ))}
            </Reveal>
            <Reveal className="cred" delay={180}>
              <h4>Skills &amp; certificates</h4>
              <div className="tags">
                {D.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
              <ul className="cert-list">
                {D.certificates.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── Work: builds + writing ───────────────────────── */}
        {(builds.length > 0 || posts.length > 0) && (
          <section id="work" className="section wrap">
            <SectionHead n="03" kicker="Selected work" title={<>Things I've <em>built</em> and written.</>} />

            {builds.length > 0 && (
              <div className="cards">
                {builds.slice(0, 3).map((b, i) => {
                  const img = extractFirstImage(b.body);
                  return (
                    <Reveal key={b.slug} delay={i * 80}>
                      <Link href={`/building/${b.slug}`} className="card">
                        <div className="card-media">
                          {img ? <img src={img} alt="" loading="lazy" /> : <span className="card-mono">{b.title.slice(0, 1)}</span>}
                        </div>
                        <div className="card-body">
                          <span className="card-meta">{b.date}</span>
                          <h3>{b.title}</h3>
                          {b.dek && <p>{b.dek}</p>}
                          <span className="card-link">Read case study →</span>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}

            {posts.length > 0 && (
              <Reveal className="post-list">
                {posts.slice(0, 4).map((p) => (
                  <Link key={p.slug} href={`/writing/${p.slug}`} className="post-row">
                    <span className="mono muted">{p.date}</span>
                    <span className="post-t">{p.title}</span>
                    <span className="arrow">→</span>
                  </Link>
                ))}
                <Link href="/writing" className="more">
                  All writing →
                </Link>
              </Reveal>
            )}
          </section>
        )}

        {/* ── Markets brief ────────────────────────────────── */}
        {news.length > 0 && (
          <section className="section wrap">
            <SectionHead n="04" kicker="Markets brief" title={<>What I'm <em>reading</em> today.</>} />
            <Reveal className="brief">
              {news.map((n) => (
                <a key={n.id} href={n.url || "/news"} target={n.url ? "_blank" : undefined} rel="noopener noreferrer" className="brief-row">
                  <span className="chip">{n.category}</span>
                  <span className="brief-t">{n.title}</span>
                  <span className="muted brief-src">{n.source}</span>
                </a>
              ))}
              <Link href="/news" className="more">
                Full brief →
              </Link>
            </Reveal>
          </section>
        )}

        {/* ── Contact ──────────────────────────────────────── */}
        <section id="contact" className="contact">
          <div className="wrap contact-inner">
            <Reveal>
              <span className="kicker on-dark">
                <span className="kicker-n">05</span>Contact
              </span>
              <h2>
                Let's <em>talk</em>.
              </h2>
              <p>
                Whether it's a graduate role, an internship or a coffee chat about markets, I'd be
                glad to hear from you.
              </p>
            </Reveal>
            <Reveal className="contact-links" delay={120}>
              <a href={`mailto:${D.email}`} className="contact-email">
                {D.email} <span aria-hidden="true">↗</span>
              </a>
              <div className="contact-row">
                {D.socials
                  .filter((s) => s.label !== "Email")
                  .map((s) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                      {s.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter visitors={visitors} />
    </div>
  );
}
