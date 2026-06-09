"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPosts, Post } from "@/lib/posts";
import FuturisticGrid from "@/components/FuturisticGrid";
import Ticker from "@/components/Ticker";
import Clock from "@/components/Clock";
import { PORTFOLIO_DATA as D } from "@/lib/data";
import NewsSection from "@/components/NewsSection";
import NewsFeed from "@/components/NewsFeed";
import BuildingSlider from "@/components/BuildingSlider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";

const SECTIONS = [
  { id: "hero", label: "00 — index" },
  { id: "writing", label: "01 — writing" },
  { id: "building", label: "02 — building" },
  { id: "about", label: "03 — about" },
  { id: "resume", label: "04 — resume" },
  { id: "contact", label: "05 — contact" },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeId, setActiveId] = useState("hero");
  const [visitors, setVisitors] = useState({ today: 0, total: 0 });

  useEffect(() => { getPosts().then(setPosts); }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const sessionKey = `visited_${today}`;
    const alreadyCounted = sessionStorage.getItem(sessionKey);
    const totalRef = doc(db, "meta", "visitors");
    const todayRef = doc(db, "meta", `visitors_${today}`);
    async function trackAndRead() {
      if (!alreadyCounted) {
        sessionStorage.setItem(sessionKey, "1");
        await Promise.all([
          setDoc(totalRef, { total: increment(1) }, { merge: true }),
          setDoc(todayRef, { count: increment(1), date: today }, { merge: true }),
        ]);
      }
      const [totalSnap, todaySnap] = await Promise.all([getDoc(totalRef), getDoc(todayRef)]);
      setVisitors({
        total: totalSnap.exists() ? (totalSnap.data().total ?? 0) : 0,
        today: todaySnap.exists() ? (todaySnap.data().count ?? 0) : 0,
      });
    }
    trackAndRead();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= 80) {
          setActiveId(SECTIONS[i].id);
          return;
        }
      }
      setActiveId("hero");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="v3 pf-root" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <FuturisticGrid color="#00e5ff" accent="#ff4dd2" density={60} />

      <header className="v3-doc-head">
        <div>VISITORS · TODAY <b>{visitors.today}</b> · TOTAL <b>{visitors.total}</b></div>
        <div className="center">/ HOME /</div>
        <div className="right"><Clock /></div>
      </header>

      <div className="v3-writing-ticker">
        <span className="lbl">/ LIVE FEED</span>
        <div className="ticker-wrap"><Ticker /></div>
      </div>

      <div className="v3-grid">
        <aside className="v3-side">
          <div className="branding">CHOI<span className="dot">.</span>JUHWAN</div>
          <div className="tag">CRYPTO · RESEARCHER · BUILDER</div>
          <h5>/ INDEX</h5>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id} className={activeId === s.id ? "active" : ""}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
          <h5>/ PAGES</h5>
          <ul>
            <li><Link href="/writing">writing</Link></li>
            <li><Link href="/news">ai news</Link></li>
          </ul>
          <h5>/ ELSEWHERE</h5>
          <ul>
            {D.socials.slice(0, 4).map((s) => (
              <li key={s.label}><a href={s.url}>{s.label.toLowerCase()}</a></li>
            ))}
          </ul>
          {/* <div className="now-box">
            <b>/ NOW</b>
            {D.now.slice(0, 3).map((n, i) => <span key={i}>· {n}</span>)}
          </div> */}
        </aside>

        <main>
          <section id="hero" className="v3-hero">
            <div>
              <span className="stamp">00 / INDEX</span>
              <h1>Choi<br /><span className="underline">Juhwan</span>,<br />online.</h1>
              <p className="role">Independent researcher and builder. I write about restaking, intent architectures, and L2 economics. I ship small tools for onchain analysts. {D.location}.</p>
              <div className="keylinks">
                <a href="#writing">READ THE WRITING ↗</a>
                <a href="#building">SEE WHAT'S SHIPPING ↗</a>
                <a href="#contact">SAY HELLO ↗</a>
              </div>
            </div>
            <div>
              <div className="spec">
                <div className="spec-head"><span>// SPEC SHEET</span><span>v2026.05</span></div>
                <div className="row"><dt>NAME</dt><dd>{D.name}</dd></div>
                <div className="row"><dt>HANDLE</dt><dd>{D.handle}</dd></div>
                <div className="row"><dt>ROLE</dt><dd>{D.role}</dd></div>
                <div className="row"><dt>BASE</dt><dd>{D.location}</dd></div>
                <div className="row"><dt>FOCUS</dt><dd>Blockchain · Cryptoeconomics · Onchain Data</dd></div>
                {/* <div className="row"><dt>STATUS</dt><dd><b>● Open to research RFPs</b></dd></div> */}
                {/* <div className="row"><dt>RATE</dt><dd>On request — usually fixed-scope</dd></div> */}
              </div>
              <NewsFeed />
            </div>
          </section>

          <header id="writing" className="v3-sech">
            <span className="id">/ 01</span>
            <h2>writing<span className="accent">.</span></h2>
            <span className="meta">{posts.length} POSTS · LONG-FORM · UPDATED WEEKLY</span>
          </header>
          <section className="v3-blog">
            {posts.length === 0 && (
              <div style={{ padding: "32px", color: "var(--dim)", fontSize: 12, letterSpacing: "0.16em" }}>NO POSTS YET.</div>
            )}
            {posts.slice(0, 4).map((p, i) => (
              <Link key={p.slug} className="post" href={`/writing/${p.slug}`}>
                <span className="idx">/{String(posts.length - i).padStart(3, "0")}</span>
                <span className="date">{p.date}</span>
                <div>
                  <div className="ttl">{p.title}</div>
                  <div className="dek">{p.dek && p.dek.length > 80 ? p.dek.slice(0, 80) + "…" : p.dek}</div>
                </div>
                <span className="tag">{p.tag === "RESEARCH" ? "OPINION" : p.tag}</span>
                <span className="stat"></span>
              </Link>
            ))}
          </section>
          <div className="v3-see-all">
            <Link href="/writing">
              SEE ALL WRITING <span className="arr">↗</span>
              <span className="cnt">{posts.length} POSTS · ARCHIVE</span>
            </Link>
          </div>

          {/* <header id="ainews" className="v3-sech">
            <span className="id">/ 02</span>
            <h2>daily ai news curation<span className="accent">.</span></h2>
            <span className="meta">CURATED · UPDATED DAILY 8PM SGT</span>
          </header>
          <NewsSection />

          <div className="v3-see-all">
            <Link href="/news">
              SEE ALL AI NEWS <span className="arr">↗</span>
              <span className="cnt">ARCHIVE</span>
            </Link>
          </div> */}

          <header id="building" className="v3-sech">
            <span className="id">/ 02</span>
            <h2>building<span className="accent">.</span></h2>
          </header>
          <BuildingSlider />

          <header id="about" className="v3-sech">
            <span className="id">/ 03·04</span>
            <h2>about<span className="accent">.</span></h2>
            <span className="meta">BIO · EXPERIENCE · UPDATED 2026.04</span>
          </header>
          <section className="v3-about">
            <div>
              <h4>/ BIO</h4>
              <p style={{ color: "#fff", fontSize: 18 }}>{D.bio}</p>
              <p>I tend to write in long form because most of what's interesting in crypto doesn't compress to a tweet.</p>
              <p>Off-chain: 35mm photography (mostly Seoul at night), running, and a long-running attempt to learn Mandarin.</p>
              <div style={{ marginTop: 24, padding: 16, border: "1px solid var(--cyan)", maxWidth: 420 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--cyan)", marginBottom: 8 }}>/ AVAILABILITY</div>
                <div style={{ fontSize: 14, color: "#fff" }}>Open to <b style={{ color: "var(--cyan)" }}>part-time or full-time roles</b>, including internships.</div>
              </div>
            </div>
            <div id="resume" className="resume">
              <h4>/ EXPERIENCE</h4>
              {D.experience.map((e, i) => (
                <div key={i} className="row">
                  <div className="period">{e.period}</div>
                  <div>
                    <div className="org">{e.org}</div>
                    <div className="role">{e.role}</div>
                    <div className="note">{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="contact" className="v3-contact">
            <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--cyan)" }}>/ 05 — CONTACT</span>
            <h2>Get in <span className="underline">touch</span>.</h2>
            <p style={{ maxWidth: "50ch", color: "#c0c8cc", fontSize: 15, lineHeight: 1.6 }}>Best over email for long things. DMs open on Telegram for everything else.</p>
            <div className="grid">
              {D.socials.map((s) => (
                <a key={s.label} href={s.url}>
                  <span className="l">/ {s.label}</span>
                  <span className="h">{s.handle}</span>
                </a>
              ))}
            </div>
          </section>

          <footer className="v3-foot">
            <span>© 2026 CHOI JUHWAN · NO COOKIES · NO ANALYTICS</span>
            <span>SET IN SPACE GROTESK + JETBRAINS MONO <Link href="/admin" style={{ color: "var(--dim)", opacity: 0.3, textDecoration: "none" }}>·</Link></span>
          </footer>
        </main>
      </div>
    </div>
  );
}
