import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface BuildLink { label: string; url: string; }

export interface Build {
  id: string;
  slug: string;
  title: string;
  dek: string;
  date: string;
  status: string;
  body: string;
  links?: BuildLink[];
  updatedAt?: number;
}

export function extractFirstImage(body: string): string | null {
  const m = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

export async function getBuilds(): Promise<Build[]> {
  const snap = await getDocs(collection(db, "builds"));
  return snap.docs
    .map((d) => d.data() as Build)
    .filter((b) => b.status === "published")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function getBuild(slug: string): Promise<Build | null> {
  const snap = await getDoc(doc(db, "builds", slug));
  if (!snap.exists()) return null;
  return snap.data() as Build;
}
