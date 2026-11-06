"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBuild, getBuilds, type Build } from "@/lib/builds";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ArticleView from "@/components/ArticleView";

export default function BuildPage() {
  const { slug } = useParams<{ slug: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [prev, setPrev] = useState<Build | null>(null);
  const [next, setNext] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([getBuild(slug), getBuilds()]).then(([b, all]) => {
      setBuild(b && b.status === "published" ? b : null);
      const idx = all.findIndex((a) => a.slug === slug);
      setPrev(idx >= 0 ? all[idx + 1] || null : null);
      setNext(idx > 0 ? all[idx - 1] : null);
      setLoading(false);
    });
  }, [slug]);

  return (
    <div className="site">
      <SiteNav ticker={false} />
      {loading ? (
        <div className="state">Loading…</div>
      ) : !build ? (
        <div className="state">This project isn't available.</div>
      ) : (
        <ArticleView item={build} tag="Project" base="/building" backLabel="All projects" prev={prev} next={next} />
      )}
      <div style={{ height: 96 }} />
      <SiteFooter />
    </div>
  );
}
