"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

async function resolveImgRefs(body: string): Promise<string> {
  const refs = [...body.matchAll(/!\[([^\]]*)\]\(imgref::([^):]+)::(\d+)\)/g)];
  for (const m of refs) {
    const [full, alt, imgDocId, totalStr] = m;
    const total = parseInt(totalStr);
    const chunkSnaps = await Promise.all(
      Array.from({ length: total }, (_, i) => getDoc(doc(db, "post_images", `${imgDocId}-c${i}`)))
    );
    const dataUrl = chunkSnaps.map((s) => (s.exists() ? s.data().data : "")).join("");
    if (dataUrl) body = body.replace(full, `![${alt}](${dataUrl})`);
  }
  return body;
}

export function md2html(src: string): string {
  const codeBlocks: string[] = [];
  const imgBlocks: string[] = [];
  src = src.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    imgBlocks.push(`<figure><img src='${url}' alt='${alt}'/></figure>`);
    return `%%IMG${imgBlocks.length - 1}%%`;
  });
  src = src.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const trimmed = code.trim();
    const grammar = lang && Prism.languages[lang];
    const highlighted = grammar
      ? Prism.highlight(trimmed, grammar, lang)
      : trimmed.replace(/[&<>"']/g, (c: string) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
    const langLabel = lang ? `<span class='lang'>${lang}</span>` : "";
    codeBlocks.push(`<pre>${langLabel}<code class='language-${lang||"text"}'>${highlighted}</code></pre>`);
    return `%%CODE${codeBlocks.length - 1}%%`;
  });
  const inlineCode: string[] = [];
  src = src.replace(/`([^`]+)`/g, (_, inner) => {
    const escaped = inner.replace(/[&<>"']/g, (c: string) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
    inlineCode.push(`<code>${escaped}</code>`);
    return `%%IC${inlineCode.length - 1}%%`;
  });
  src = src.replace(/^---$/gm, "%%HR%%");
  src = src.replace(/^>\s?(.+)$/gm, "%%BQ%%$1%%/BQ%%");
  let h = src.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
  h = h.replace(/%%HR%%/g,"<hr/>");
  h = h.replace(/^####\s+(.+)$/gm,"<h4>$1</h4>");
  h = h.replace(/^###\s+(.+)$/gm,"<h3>$1</h3>");
  h = h.replace(/^##\s+(.+)$/gm,(_,t)=>{const id=t.toLowerCase().replace(/[^\w]+/g,"-").replace(/^-|-$/g,"");return `<h2 id='${id}'>${t}</h2>`;});
  h = h.replace(/^#\s+(.+)$/gm,(_,t)=>{const id=t.toLowerCase().replace(/[^\w]+/g,"-").replace(/^-|-$/g,"");return `<h1 id='${id}'>${t}</h1>`;});
  h = h.replace(/%%BQ%%(.+?)%%\/BQ%%/g,"<blockquote>$1</blockquote>");
  h = h.replace(/((?:^\|.+\|\n?)+)/gm,(block)=>{const rows=block.trim().split("\n").filter((l:string)=>l.trim()&&!/^\|[\s\-|]+\|$/.test(l.trim()));if(rows.length===0)return block;const parseRow=(l:string)=>l.trim().replace(/^\||\|$/g,"").split("|").map((c:string)=>c.trim());const[head,...body]=rows;const ths=parseRow(head).map((c:string)=>`<th>${c}</th>`).join("");const trs=body.map((r:string)=>`<tr>${parseRow(r).map((c:string)=>`<td>${c}</td>`).join("")}</tr>`).join("");return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;});
  h = h.replace(/((?:- .+\n?)+)/g,(block)=>{const items=block.trim().split("\n").filter((l:string)=>l.startsWith("- ")).map((l:string)=>`<li>${l.slice(2)}</li>`).join("");return `<ul>${items}</ul>`;});
  h = h.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  h = h.replace(/_([^_]+)_/g,"<em>$1</em>");
  h = h.replace(/%%IC(\d+)%%/g, (_, i) => inlineCode[+i]);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"<a href='$2'>$1</a>");
    h = h.replace(/\n\n+/g,`</p><p>`);
  h = h.replace(/\n/g,"<br/>");
  h = h.replace(/(<br\/>)+(<\/p>)/g,"$2");
  h = `<p>`+h+"</p>";
  h = h.replace(/%%CODE(\d+)%%/g,(_,i)=>codeBlocks[+i]);
  h = h.replace(/%%IMG(\d+)%%/g,(_,i)=>imgBlocks[+i]);
  h = h.replace(/<p[^>]*>(<h\d|<hr|<pre|<blockquote|<ul|<table|<figure)/g,"$1");
  h = h.replace(/(<\/h\d>|<\/pre>|<\/blockquote>|<\/ul>|<\/table>|<\/figure>|<hr[^>]*\/>)<\/p>/g,"$1");
  h = h.replace(/<p[^>]*>\s*<\/p>/g,"");
  const BLOCK="h\\d|hr|pre|blockquote|ul|table|figure";
  h = h.replace(new RegExp(`(<(?:${BLOCK})[^>]*>|</(?:${BLOCK})>)(<br/>)+(<(?:${BLOCK})[^>]*>|</(?:${BLOCK})>)`,"g"),"$1$3");
  h = h.replace(new RegExp(`(<(?:${BLOCK})[^>]*>)(<br/>)+`,"g"),"$1");
  h = h.replace(new RegExp(`(<br/>)+(</(?:${BLOCK})>)`,"g"),"$2");
  return h;
}

export default function PostBody({ body }: { body: string }) {
  const [resolved, setResolved] = useState<string | null>(null);
  useEffect(() => { resolveImgRefs(body).then((b) => setResolved(md2html(b))); }, [body]);
  if (resolved === null) return <div className="prose" dangerouslySetInnerHTML={{ __html: md2html(body) }} />;
  return <div className="prose" dangerouslySetInnerHTML={{ __html: resolved }} />;
}
