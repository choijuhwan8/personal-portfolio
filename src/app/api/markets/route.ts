import { NextResponse } from "next/server";

const INSTRUMENTS = [
  { sym: "^GSPC", label: "S&P 500", kind: "index" },
  { sym: "^IXIC", label: "NASDAQ", kind: "index" },
  { sym: "^STI", label: "STI", kind: "index" },
  { sym: "^KS11", label: "KOSPI", kind: "index" },
  { sym: "^N225", label: "NIKKEI 225", kind: "index" },
  { sym: "^HSI", label: "HANG SENG", kind: "index" },
  { sym: "SGD=X", label: "USD/SGD", kind: "fx" },
  { sym: "KRW=X", label: "USD/KRW", kind: "fx" },
  { sym: "^TNX", label: "UST 10Y", kind: "yield" },
  { sym: "GC=F", label: "GOLD", kind: "commodity" },
  { sym: "BZ=F", label: "BRENT", kind: "commodity" },
] as const;

type Quote = { sym: string; label: string; kind: string; price: number; change: number };

export const revalidate = 60;

async function fetchQuote(i: (typeof INSTRUMENTS)[number]): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(i.sym)}?range=1d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0 (portfolio market strip)" }, next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const meta = (await res.json())?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number") return null;
    const prev = meta.chartPreviousClose ?? meta.previousClose;
    const change =
      typeof meta.regularMarketChangePercent === "number"
        ? meta.regularMarketChangePercent
        : prev
          ? ((price - prev) / prev) * 100
          : 0;
    return { sym: i.sym, label: i.label, kind: i.kind, price, change };
  } catch {
    return null;
  }
}

export async function GET() {
  const quotes = (await Promise.all(INSTRUMENTS.map(fetchQuote))).filter(Boolean) as Quote[];
  return NextResponse.json({ quotes, asOf: Date.now() });
}
