"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPost, getPosts, type Post } from "@/lib/posts";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ArticleView from "@/components/ArticleView";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [prev, setPrev] = useState<Post | null>(null);
  const [next, setNext] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([getPost(slug), getPosts()]).then(([p, all]) => {
      // Only published posts are viewable.
      setPost(p && p.status === "published" ? p : null);
      const idx = all.findIndex((a) => a.slug === slug);
      setPrev(idx >= 0 ? all[idx + 1] || null : null);
      setNext(idx > 0 ? all[idx - 1] : null);
      setLoading(false);
    });
  }, [slug]);

  const tag = post?.tag === "RESEARCH" ? "Opinion" : post?.tag === "STUDY" ? "Study notes" : post?.tag || "";

  return (
    <div className="site">
      <SiteNav ticker={false} />
      {loading ? (
        <div className="state">Loading…</div>
      ) : !post ? (
        <div className="state">This post isn't available.</div>
      ) : (
        <ArticleView item={post} tag={tag} base="/writing" backLabel="All writing" prev={prev} next={next} />
      )}
      <div style={{ height: 96 }} />
      <SiteFooter />
    </div>
  );
}
