/* V3 — Wireframe Archive variation */
function V3Archive() {
  const D = window.PORTFOLIO_DATA;
  const clock = window.useClock();
  const block = window.useBlockHeight();
  const [posts, setPosts] = React.useState([]);
  const [postsLoading, setPostsLoading] = React.useState(true);

  React.useEffect(() => {
    if (window._firebasePostsPromise) {
      window._firebasePostsPromise
        .then(p => { setPosts(p); setPostsLoading(false); })
        .catch(() => setPostsLoading(false));
    } else {
      setPostsLoading(false);
    }
  }, []);

  // === secret admin shortcut ===
  // type "admin" anywhere to navigate to admin.html (compose page)
  // also: shift+click the block height number
  React.useEffect(() => {
    let buf = "";
    const onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      buf = (buf + e.key.toLowerCase()).slice(-5);
      if (buf === "admin") { window.location.href = "admin.html"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="v3 pf-root">
      <window.FuturisticGrid color="#00e5ff" accent="#ff4dd2" density={60} />

      <header className="v3-doc-head">
        <div>DOC <b>portfolio.choi.juhwan</b> · rev 026</div>
        <div className="center">/ INDEX · DRAFT · v2026.05 /</div>
        <div
          className="right"
          onClick={(e) => { if (e.shiftKey) window.location.href = "admin.html"; }}
          title=""
          style={{cursor: "default"}}
        >{window.fmtClock(clock).slice(0,16)} · BLK <b>#{block.toLocaleString()}</b></div>
      </header>

      {/* live crypto feed — top of page */}
      <div className="v3-writing-ticker">
        <span className="lbl">/ LIVE FEED</span>
        <div className="ticker-wrap"><window.Ticker /></div>
      </div>

      <div className="v3-grid">
        {/* sidebar */}
        <aside className="v3-side">
          <div className="branding">CHOI<span className="dot">.</span>JUHWAN</div>
          <div className="tag">CRYPTO · RESEARCHER · BUILDER</div>

          <h5>/ INDEX</h5>
          <ul>
            <li><a href="#hero">00 — index</a></li>
            <li><a href="#writing">01 — writing</a></li>
            <li><a href="#building">02 — building</a></li>
            <li><a href="#about">03 — about</a></li>
            <li><a href="#resume">04 — resume</a></li>
            <li><a href="#contact">05 — contact</a></li>
          </ul>

          <h5>/ ELSEWHERE</h5>
          <ul>
            {D.socials.slice(0,4).map(s => (
              <li key={s.label}><a href={s.url}>{s.label.toLowerCase()}</a></li>
            ))}
          </ul>

          <div className="now-box">
            <b>/ NOW</b>
            {D.now.slice(0,3).map((n,i) => <span key={i}>· {n}</span>)}
          </div>
        </aside>

        {/* main */}
        <main className="v3-main">
          {/* HERO */}
          <section id="hero" className="v3-hero">
            <div>
              <span className="stamp">00 / INDEX</span>
              <h1>
                Choi<br/>
                <span className="underline">Juhwan</span>,<br/>
                online.
              </h1>
              <p className="role">
                Independent researcher and builder. I write about restaking,
                intent architectures, and L2 economics. I ship small tools
                for onchain analysts. {D.location}.
              </p>
              <div className="keylinks">
                <a href="#writing">READ THE WRITING ↗</a>
                <a href="#building">SEE WHAT'S SHIPPING ↗</a>
                <a href="#contact">SAY HELLO ↗</a>
              </div>
            </div>
            <div className="right">
              <div className="spec">
                <div className="spec-head">
                  <span>// SPEC SHEET</span>
                  <span>v2026.05</span>
                </div>
                <div className="row"><dt>NAME</dt><dd>{D.name}</dd></div>
                <div className="row"><dt>HANDLE</dt><dd>{D.handle}</dd></div>
                <div className="row"><dt>ROLE</dt><dd>{D.role}</dd></div>
                <div className="row"><dt>BASE</dt><dd>{D.location}</dd></div>
                <div className="row"><dt>FOCUS</dt><dd>Restaking · Intents · L2 econ</dd></div>
                <div className="row"><dt>STATUS</dt><dd><b>● Open to research RFPs</b></dd></div>
                <div className="row"><dt>RATE</dt><dd>On request — usually fixed-scope</dd></div>
                <div className="row"><dt>PGP</dt><dd>0x9F4A · 7E12 · BB03</dd></div>
              </div>
            </div>
          </section>

          {/* WRITING */}
          <header id="writing" className="v3-sech">
            <span className="id">/ 01</span>
            <h2>writing<span className="accent">.</span></h2>
            <span className="meta">{postsLoading ? "LOADING…" : `${posts.length} POSTS · LONG-FORM · UPDATED WEEKLY`}</span>
          </header>
          <section className="v3-blog">
            {postsLoading && (
              <div style={{padding:"32px", color:"var(--dim)", fontSize:12, letterSpacing:"0.16em"}}>FETCHING POSTS…</div>
            )}
            {!postsLoading && posts.length === 0 && (
              <div style={{padding:"32px", color:"var(--dim)", fontSize:12, letterSpacing:"0.16em"}}>NO POSTS YET.</div>
            )}
            {posts.slice(0,4).map((p, i) => (
              <a key={p.id || p.slug} className="post" href={`post.html?slug=${p.slug}`}>
                <span className="idx">/{String(i+1).padStart(3,"0")}</span>
                <span className="date">{p.date}</span>
                <div>
                  <div className="ttl">{p.title}</div>
                  <div className="dek">{p.dek}</div>
                </div>
                <span className="tag">{p.tag}</span>
                <span className="stat">{p.readtime || ""}</span>
              </a>
            ))}
          </section>
          <div className="v3-see-all">
            <a href="writing.html">
              SEE ALL WRITING <span className="arr">↗</span>
              <span className="cnt">{posts.length} POSTS · ARCHIVE</span>
            </a>
          </div>

          {/* BUILDING */}
          <header id="building" className="v3-sech">
            <span className="id">/ 02</span>
            <h2>building<span className="accent">.</span></h2>
            <span className="meta">{D.projects.length} PROJECTS · 3 LIVE · 1 ARCHIVED</span>
          </header>
          <section className="v3-projects">
            {D.projects.map(p => (
              <article key={p.name} className="v3-prow">
                <div className="left">
                  <div className="name">{p.name}</div>
                  <div className="v">{p.version}</div>
                  <a className="url" href={`#${p.name}`}>↳ {p.url}</a>
                </div>
                <div className="mid">
                  <p className="sum">{p.summary}</p>
                  <div className="stack">{p.stack.map(s => <span key={s}>{s}</span>)}</div>
                </div>
                <div className="right">
                  <div><span className="status" data-s={p.status}>{p.status}</span></div>
                  <span className="mv">{p.metric.value}</span>
                  <div className="ml">{p.metric.label}</div>
                </div>
              </article>
            ))}
          </section>

          {/* ABOUT + RESUME */}
          <header id="about" className="v3-sech">
            <span className="id">/ 03·04</span>
            <h2>about<span className="accent">.</span></h2>
            <span className="meta">BIO · EXPERIENCE · UPDATED 2026.04</span>
          </header>
          <section className="v3-about">
            <div>
              <h4>/ BIO</h4>
              <p style={{color:"#fff", fontSize:18}}>{D.bio}</p>
              <p>
                I tend to write in long form because most of what's interesting in
                crypto doesn't compress to a tweet. The posts here are artifacts
                of trying to understand specific markets in painful detail.
              </p>
              <p>
                Off-chain: 35mm photography (mostly Seoul at night), running, and
                a long-running attempt to learn Mandarin.
              </p>
              <div style={{marginTop:24, padding:16, border:"1px solid var(--cyan)", maxWidth:420}}>
                <div style={{fontSize:10, letterSpacing:"0.2em", color:"var(--cyan)", marginBottom:8}}>/ AVAILABILITY</div>
                <div style={{fontSize:14, color:"#fff"}}>Open to <b style={{color:"var(--cyan)"}}>research RFPs</b> and short consulting blocks (≤ 6 weeks). Not looking for full-time roles.</div>
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
              <a href="#" style={{display:"inline-block", marginTop:24, padding:"10px 16px", border:"1px solid var(--cyan)", color:"var(--cyan)", fontSize:11, letterSpacing:"0.18em"}}>
                ↓ DOWNLOAD RESUME.PDF
              </a>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="v3-contact">
            <span style={{fontSize:10, letterSpacing:"0.2em", color:"var(--cyan)"}}>/ 05 — CONTACT</span>
            <h2>Get in <span className="underline">touch</span>.</h2>
            <p style={{maxWidth:"50ch", color:"#c0c8cc", fontSize:15, lineHeight:1.6}}>
              Best over email for long things. DMs open on X / Farcaster for everything else. I read everything; I reply to most.
            </p>
            <div className="grid">
              {D.socials.map(s => (
                <a key={s.label} href={s.url}>
                  <span className="l">/ {s.label}</span>
                  <span className="h">{s.handle}</span>
                </a>
              ))}
            </div>
          </section>

          <footer className="v3-foot">
            <span>© 2026 CHOI JUHWAN · NO COOKIES · NO ANALYTICS</span>
            <span>SET IN SPACE GROTESK + JETBRAINS MONO <a href="admin.html" style={{color:"var(--dim)", opacity:0.3, textDecoration:"none"}} title="">·</a></span>
          </footer>
        </main>
      </div>
    </div>
  );
}
window.V3Archive = V3Archive;
