import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, orderBy, query, limit } from "firebase/firestore";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  body: string;
  date: string;
  source: string;
  category: string;
  significance: number;
  imageUrl: string;
}

export async function getLatestCoverImage(): Promise<string> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const snap = await getDoc(doc(db, "news_meta", today));
    return snap.exists() ? (snap.data().coverImage || "") : "";
  } catch {
    return "";
  }
}

export async function getNews(count = 6): Promise<NewsItem[]> {
  try {
    const q = query(collection(db, "news"), orderBy("date", "desc"), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsItem));
  } catch {
    return [];
  }
}
