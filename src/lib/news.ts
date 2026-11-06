import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

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
  beat?: string;
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

/** Only items written by the markets digest (beat: "markets") are shown. */
export async function getNews(count = 6): Promise<NewsItem[]> {
  try {
    const q = query(collection(db, "news"), where("beat", "==", "markets"));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as NewsItem)
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.significance || 0) - (a.significance || 0))
      .slice(0, count);
  } catch {
    return [];
  }
}
