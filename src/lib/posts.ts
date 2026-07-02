import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface Post {
  id: string;
  slug: string;
  title: string;
  dek: string;
  tag: string;
  date: string;
  status: string;
  body: string;
  updatedAt?: number;
}

// Newest first: compare by date, then break same-day ties by the
// full millisecond publish timestamp so posts are ordered by time, not just day.
export function byDateThenTime(a: Post, b: Post): number {
  const d = (b.date || "").localeCompare(a.date || "");
  if (d !== 0) return d;
  return (b.updatedAt || 0) - (a.updatedAt || 0);
}

export async function getPosts(): Promise<Post[]> {
  const snap = await getDocs(collection(db, "posts"));
  return snap.docs
    .map((d) => d.data() as Post)
    .filter((p) => p.status === "published")
    .sort(byDateThenTime);
}

export async function getPost(slug: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", slug));
  if (!snap.exists()) return null;
  return snap.data() as Post;
}
