/* V1 — Terminal / Bloomberg variation */
const { useEffect: useEffectV1, useState: useStateV1 } = React;

function V1Terminal() {
  const D = window.PORTFOLIO_DATA;
  const clock = window.useClock();
  const block = window.useBlockHeight();

  return (
    <div className="v1 pf-root">
      <window.GridBG color="#00ff88" density={56} pulse={true} />

      {/* top status bar */}
      <div className="v1-top">
        <div className="blink">SYSTEM ONLINE</div>
        <div>
          <span style={{color:"var(--dim)"}}>SESSION</span>&nbsp;
          {window.fmtClock(clock)}
          &nbsp;&nbsp;<span style={{color:"var(--dim)"}}>BLOCK</span>&nbsp;
          <span style={{color:"#fff"}}>#{block.toLocaleString()}</span>
        </div>
        <div>
          <span>CHOI.JUHWAN/v2026</span>
          <span style={{color:"var(--dim)"}}>// portfolio.exe</span>
        </div>
      </div>

      {/* ticker */}
      <window.Ticker />

      {/* hero */}
      <section className="v1-hero">
        <div>
          <div className="crumbs">~ / portfolio / index — last commit 2h ago</div>
          <h1>
            CHOI<br/>
            JU<span className="accent">_</span>HWAN<span className="accent">.</span>
          </h1>
          <p className="role">
            Independent researcher and builder. I write about restaking,
            intent architectures, and the economics of L2s. I ship small
            tools for onchain analysts. Currently {D.location}.
          </p>
          <div className="pill-row">
            <span className="pill">AVAILABLE FOR RESEARCH</span>
            <span className="pill cyan">CONSULTING / RFP</span>
            <span className="pill mag">NOT HIRING</span>
          </div>
        </div>
        <aside className="v1-hero-side">
          <h4>// NOW.LOG</h4>
          <div style={{marginBottom: 14}}>
            {D.now.map((n, i) => (
              <div key={i} className="now-line">{n}</div>
            ))}
          </div>
          <h4>// META</h4>
          <dl>
            <dt>NAME</dt><dd>{D.name}</dd>
            <dt>HANDLE</dt><dd>{D.handle}</dd>
            <dt>LOCATION</dt><dd>{D.location}</dd>
            <dt>STATUS</dt><dd style={{color:"var(--lime)"}}>● ONLINE</dd>
            <dt>UPTIME</dt><dd>4 yrs, 2 mo</dd>
            <dt>PGP</dt><dd>0x9F4A · 7E12 · BB03</dd>
          </dl>
        </aside>
      </section>

      <div className="v1-ascii">
        ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
      </div>

      {/* BLOG */}
      <div className="v1-section-h">
        <span className="idx">SEC.01</span>
        <h2>WRITING / CRYPTO</h2>
        <span className="meta">{D.posts.length} POSTS · LAST <span>2026.05.04</span></span>
      </div>
      <section className="v1-blog">
        {D.posts.map(p => (
          <a key={p.id} className="post" href="post.html">
            <span className="date">{p.date}</span>
            <span className="tag">{p.tag}</span>
            <div>
              <div className="ttl">{p.title}</div>
              <div className="dek">{p.dek}</div>
            </div>
            <div className="stat">
              <span>{p.readtime}</span><br/>
              {p.stats.views} views<br/>
              {p.stats.comments} comments
            </div>
          </a>
        ))}
      </section>

      <div className="v1-ascii">
        ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
      </div>

      {/* PROJECTS */}
      <div className="v1-section-h">
        <span className="idx">SEC.02</span>
        <h2>PROJECTS / SHIPPING</h2>
        <span className="meta">{D.projects.length} ENTRIES · <span>3 LIVE</span></span>
      </div>
      <section className="v1-projects">
        {D.projects.map(p => (
          <div key={p.name} className="v1-card">
            <div className="row1">
              <div className="name">{p.name}</div>
              <span className="status" data-s={p.status}>{p.status}</span>
            </div>
            <div className="url">{p.url} · {p.version}</div>
            <div className="sum">{p.summary}</div>
            <div className="footer">
              <div className="stack">
                {p.stack.map(s => <span key={s}>{s}</span>)}
              </div>
              <div className="metric">
                <span className="v">{p.metric.value}</span>
                <span className="l">{p.metric.label}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="v1-ascii">
        ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
      </div>

      {/* ABOUT + RESUME */}
      <div className="v1-section-h">
        <span className="idx">SEC.03</span>
        <h2>ABOUT / RESUME</h2>
        <span className="meta">CV.MD · <span>UPDATED 2026.04</span></span>
      </div>
      <section className="v1-about">
        <div className="bio">
          <h3>// BIO</h3>
          <p>{D.bio}</p>
          <p>
            I tend to write in long form because most of what's interesting
            in this space doesn't compress to a tweet. The posts here are
            the artifacts of trying to understand a few specific markets in
            painful detail.
          </p>
          <p>
            Outside of crypto: photography (35mm, mostly Seoul at night),
            running, and a long-running attempt to learn Mandarin.
          </p>
        </div>
        <div className="v1-resume">
          <h3>// EXPERIENCE</h3>
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
          <div style={{marginTop: 20}}>
            <a className="pill" style={{color:"var(--lime)", border:"1px solid var(--lime)", padding:"8px 14px", display:"inline-block", fontSize:11, letterSpacing:"0.18em"}} href="#">
              ↓ DOWNLOAD RESUME.PDF
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="v1-contact">
        <h2>LET'S TALK<span style={{color:"#fff"}}>.</span></h2>
        <div className="socials">
          {D.socials.map(s => (
            <a key={s.label} href={s.url}>
              <span className="l">// {s.label}</span>
              <span className="h">{s.handle}</span>
            </a>
          ))}
        </div>
      </section>

      {/* footer */}
      <div className="v1-foot">
        <div>© 2026 CHOI JUHWAN · <span>BUILD a1f4.dirty</span></div>
        <div>RENDERED IN <span>0.012s</span> · NO COOKIES · NO ANALYTICS</div>
      </div>
    </div>
  );
}
window.V1Terminal = V1Terminal;
