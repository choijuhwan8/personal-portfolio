/* V2 — Oversized Marquee variation */
function V2Marquee() {
  const D = window.PORTFOLIO_DATA;
  const clock = window.useClock();

  return (
    <div className="v2 pf-root">
      <window.GridBG color="#ff2eaa" density={64} pulse={true} dotMode={true} />

      {/* nav */}
      <nav className="v2-nav">
        <span className="logo">CHOI·JUHWAN</span>
        <ul>
          <li><a href="#writing">WRITING</a></li>
          <li><a href="#building">BUILDING</a></li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
        <span style={{color:"#ff2eaa"}}>● {window.fmtClock(clock).slice(11,19)} UTC</span>
      </nav>

      {/* marquee */}
      <div className="v2-marquee">
        <div className="track">
          <span>CRYPTO RESEARCH</span><span>ONCHAIN TOOLING</span><span>RESTAKING NERD</span>
          <span>SHIPPING SLOWLY</span><span>WRITING DAILY</span><span>SEOUL → INTERNET</span>
          <span>CRYPTO RESEARCH</span><span>ONCHAIN TOOLING</span><span>RESTAKING NERD</span>
          <span>SHIPPING SLOWLY</span><span>WRITING DAILY</span><span>SEOUL → INTERNET</span>
        </div>
      </div>

      {/* hero */}
      <section className="v2-hero">
        <div className="label-row">
          <span>// PORTFOLIO · v2026.05</span>
          <span>SCROLL ↓ TO ENTER</span>
        </div>
        <h1>
          CH<span className="o">O</span>I<br/>
          JUHW<span className="m">A</span>N<span className="c">.</span>
        </h1>
        <div className="sub">
          <div>
            <h4>// ROLE</h4>
            <p>Independent researcher and builder. I write about <a href="#writing">restaking, intents, and L2 economics</a>, and ship small tools for onchain analysts.</p>
          </div>
          <div>
            <h4>// LOCATION</h4>
            <p>{D.location}. Open to remote everything. Reachable in &lt; 12h on a workday.</p>
          </div>
          <div>
            <h4>// STATUS</h4>
            <p style={{color:"#ff2eaa"}}>Available for research collabs & RFPs. Not looking for full-time roles.</p>
          </div>
        </div>
      </section>

      <div className="v2-marquee cyan">
        <div className="track">
          <span>WRITING · WRITING · WRITING ·</span>
          <span>WRITING · WRITING · WRITING ·</span>
          <span>WRITING · WRITING · WRITING ·</span>
          <span>WRITING · WRITING · WRITING ·</span>
        </div>
      </div>

      {/* BLOG */}
      <h2 id="writing" className="v2-bigtitle">
        WR<span className="accent">!</span>TING
        <span className="meta">// CRYPTO LONG-FORM · {D.posts.length} POSTS · UPDATED WEEKLY</span>
      </h2>
      <section className="v2-blog">
        {D.posts.map((p, i) => (
          <a key={p.id} className="post" href="post.html">
            <span className="num">{String(i+1).padStart(2,"0")}</span>
            <div>
              <div className="ttl">{p.title}</div>
              <div className="dek">{p.dek}</div>
              <div className="tag-row">
                <span>{p.tag}</span>
                <span>{p.readtime}</span>
                <span>{p.stats.comments} COMMENTS</span>
              </div>
            </div>
            <div className="right">
              <span className="date">{p.date}</span>
              <span className="views">{p.stats.views}</span>
              <span style={{fontSize:11, letterSpacing:"0.16em"}}>VIEWS</span>
            </div>
          </a>
        ))}
      </section>

      <div className="v2-marquee lime">
        <div className="track">
          <span>BUILDING · BUILDING · BUILDING ·</span>
          <span>BUILDING · BUILDING · BUILDING ·</span>
          <span>BUILDING · BUILDING · BUILDING ·</span>
          <span>BUILDING · BUILDING · BUILDING ·</span>
        </div>
      </div>

      {/* PROJECTS */}
      <h2 id="building" className="v2-bigtitle cyan">
        BU<span className="accent">/</span>LDING
        <span className="meta">// PROJECTS · {D.projects.length} ENTRIES · 3 LIVE · 1 ARCHIVED</span>
      </h2>
      <section className="v2-projects">
        {D.projects.map(p => (
          <article key={p.name} className="v2-pcard">
            <div className="row1">
              <div>
                <div className="name">{p.name}</div>
                <div className="v">{p.version}</div>
              </div>
              <span className="status" data-s={p.status}>{p.status}</span>
            </div>
            <div className="url">↳ {p.url}</div>
            <div className="sum">{p.summary}</div>
            <div className="footer">
              <div className="stack">{p.stack.map(s => <span key={s}>{s}</span>)}</div>
              <div className="metric">
                <span className="v2">{p.metric.value}</span>
                <span className="l">{p.metric.label}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ABOUT */}
      <section id="about" className="v2-about">
        <div className="left">
          <h3>// ABOUT</h3>
          <p style={{fontSize:24, color:"#fff", lineHeight:1.4, marginBottom:24}}>
            {D.bio}
          </p>
          <p>
            I write in long form because most of what's interesting in crypto
            doesn't compress to a tweet. The posts here are artifacts of
            trying to understand specific markets in painful detail — usually
            with a spreadsheet open, sometimes with a node syncing.
          </p>
          <p>
            Off-chain: 35mm photography (mostly Seoul at night), running, and
            a long-running attempt to learn Mandarin.
          </p>
        </div>
        <aside className="right">
          <h3>NOW.</h3>
          <p style={{marginBottom:20, fontWeight:600}}>{new Date().toLocaleDateString("en-CA")} — what I'm doing this week</p>
          <ul className="now-list">
            {D.now.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </aside>
      </section>

      {/* RESUME */}
      <section className="v2-resume">
        <h3 style={{fontSize:12, letterSpacing:"0.2em", color:"var(--cyan)", marginBottom:24}}>// EXPERIENCE</h3>
        {D.experience.map((e, i) => (
          <div key={i} className="row">
            <div className="period">{e.period}</div>
            <div>
              <div className="org">{e.org}</div>
              <div className="role">{e.role}</div>
            </div>
            <div className="note">{e.note}</div>
          </div>
        ))}
        <a href="#" style={{display:"inline-block", marginTop:28, padding:"14px 22px", background:"var(--cyan)", color:"#000", fontWeight:700, letterSpacing:"0.16em", fontSize:13}}>
          ↓ DOWNLOAD RESUME.PDF
        </a>
      </section>

      <window.Ticker />

      {/* CONTACT */}
      <section id="contact" className="v2-contact">
        <h2>SAY<br/>HELLO.</h2>
        <div className="row">
          {D.socials.map(s => (
            <a key={s.label} href={s.url}>
              <span className="l">// {s.label}</span>
              <span className="h">{s.handle}</span>
            </a>
          ))}
        </div>
        <div style={{marginTop:24, fontSize:13, letterSpacing:"0.1em"}}>
          BEST OVER EMAIL FOR LONG STUFF. DMS OPEN ON X / FARCASTER FOR EVERYTHING ELSE.
        </div>
      </section>

      <div className="v2-foot">
        <span>© 2026 CHOI JUHWAN</span>
        <span>NO COOKIES · NO TRACKING · BUILT IN A WEEKEND</span>
      </div>
    </div>
  );
}
window.V2Marquee = V2Marquee;
