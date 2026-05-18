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

export async function getPosts(): Promise<Post[]> {
  const snap = await getDocs(collection(db, "posts"));
  return snap.docs
    .map((d) => d.data() as Post)
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function getPost(slug: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", slug));
  if (!snap.exists()) return null;
  return snap.data() as Post;
}
