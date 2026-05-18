"use client";

function md2html(src: string): string {
  const codeBlocks: string[] = [];
  src = src.replace(/```([\s\S]*?)```/g, (_, code) => {
    const escaped = code.trim().replace(/[&<>"']/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
    codeBlocks.push(`<pre style='background:rgba(0,229,255,0.06);border:1px solid rgba(0,229,255,0.25);padding:14px;font-family:JetBrains Mono,monospace;font-size:13px;overflow:auto;margin:1.2em 0;line-height:1.6'><code>${escaped}</code></pre>`);
    return `%%CODE${codeBlocks.length - 1}%%`;
  });
  src = src.replace(/^---$/gm, "%%HR%%");
  src = src.replace(/^>\s?(.+)$/gm, "%%BQ%%$1%%/BQ%%");
  let h = src.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
  h = h.replace(/%%HR%%/g, "<hr style='border:0;border-top:1px solid rgba(255,255,255,0.15);margin-top:0.7em;margin-bottom:1.8em'/>");
  h = h.replace(/^####\s+(.+)$/gm, "<h4 style='font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:0.2em;color:#5e6770;text-transform:uppercase;margin-top:1.4em'>$1</h4>");
  h = h.replace(/^###\s+(.+)$/gm, "<h3 style='font-family:JetBrains Mono,monospace;font-size:13px;letter-spacing:0.2em;color:#00e5ff;text-transform:uppercase;margin-top:1.8em'>$1</h3>");
  h = h.replace(/^##\s+(.+)$/gm, (_, t) => { const id = t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""); return `<h2 id='${id}' style='font-family:Space Grotesk,monospace;font-size:32px;font-weight:700;color:#e6ecec;letter-spacing:-0.02em;margin-top:0;margin-bottom:0.5em;scroll-margin-top:80px'>${t}</h2>`; });
  h = h.replace(/^#\s+(.+)$/gm, (_, t) => { const id = t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""); return `<h1 id='${id}' style='font-family:Space Grotesk,monospace;font-size:48px;font-weight:700;color:#e6ecec;letter-spacing:-0.03em;margin-bottom:0.5em;scroll-margin-top:80px'>${t}</h1>`; });
  h = h.replace(/%%BQ%%(.+?)%%\/BQ%%/g, "<blockquote style='border-left:3px solid #00e5ff;padding:12px 20px;color:#e6ecec;font-style:italic;background:rgba(0,229,255,0.04);font-size:17px;margin:1.2em 0'>$1</blockquote>");
  h = h.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split("\n").filter((l: string) => l.trim() && !/^\|[\s\-|]+\|$/.test(l.trim()));
    if (rows.length === 0) return block;
    const parseRow = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c: string) => c.trim());
    const [head, ...body] = rows;
    const ths = parseRow(head).map((c: string) => `<th style='background:rgba(0,229,255,0.08);color:#00e5ff;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;padding:8px 12px;border:1px solid rgba(0,229,255,0.25);text-align:left'>${c}</th>`).join("");
    const trs = body.map((r: string) => `<tr>${parseRow(r).map((c: string) => `<td style='padding:8px 12px;border:1px solid rgba(255,255,255,0.1);color:#c8d0d4;font-size:13px;vertical-align:top'>${c}</td>`).join("")}</tr>`).join("");
    return `<table style='width:100%;border-collapse:collapse;margin:1.2em 0'><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  h = h.replace(/((?:- .+\n?)+)/g, (block) => {
    const items = block.trim().split("\n").filter((l: string) => l.startsWith("- ")).map((l: string) => `<li style='margin:0.5em 0;color:#d0d8dc'>${l.slice(2)}</li>`).join("");
    return `<ul style='padding-left:1.4em;margin:1em 0'>${items}</ul>`;
  });
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong style='color:#e6ecec'>$1</strong>");
  h = h.replace(/_([^_]+)_/g, "<em style='color:#00e5ff;font-style:italic'>$1</em>");
  h = h.replace(/`([^`]+)`/g, "<code style='font-family:JetBrains Mono,monospace;font-size:0.82em;background:rgba(0,229,255,0.08);color:#00e5ff;padding:2px 6px;border:1px solid rgba(0,229,255,0.25)'>$1</code>");
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' style='color:#00e5ff;text-decoration:underline;text-underline-offset:4px'>$1</a>");
  const P = "margin-bottom:1.1em;font-family:Newsreader,serif;font-size:16px;line-height:1.7;color:#d0d8dc";
  h = h.replace(/\n\n+/g, `</p><p style='${P}'>`);
  h = h.replace(/\n/g, "<br/>");
  h = h.replace(/(<br\/>)+(<\/p>)/g, "$2");
  h = `<p style='${P}'>` + h + "</p>";
  // restore code blocks AFTER paragraph splitting so \n\n inside <pre> isn't split
  h = h.replace(/%%CODE(\d+)%%/g, (_, i) => codeBlocks[+i]);
  // unwrap block elements from <p> tags
  h = h.replace(/<p[^>]*>(<h\d|<hr|<pre|<blockquote|<ul|<table)/g, "$1");
  h = h.replace(/(<\/h\d>|<\/pre>|<\/blockquote>|<\/ul>|<\/table>|<hr[^>]*\/>)<\/p>/g, "$1");
  h = h.replace(/<p[^>]*>\s*<\/p>/g, "");
  // strip stray <br/> between two block-level elements only
  const BLOCK = "h\\d|hr|pre|blockquote|ul|table";
  h = h.replace(new RegExp(`(<(?:${BLOCK})[^>]*>|</(?:${BLOCK})>)(<br/>)+(<(?:${BLOCK})[^>]*>|</(?:${BLOCK})>)`, "g"), "$1$3");
  // strip <br/> immediately inside opening/closing block tags
  h = h.replace(new RegExp(`(<(?:${BLOCK})[^>]*>)(<br/>)+`, "g"), "$1");
  h = h.replace(new RegExp(`(<br/>)+(</(?:${BLOCK})>)`, "g"), "$2");
  return h;
}

export default function PostBody({ body }: { body: string }) {
  return <div dangerouslySetInnerHTML={{ __html: md2html(body) }} />;
}
