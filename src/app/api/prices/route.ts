import { NextResponse } from "next/server";

const COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "staked-ether",
  "renzo-restaked-eth",
  "celestia",
  "arbitrum",
  "optimism",
  "pyth-network",
  "blast",
  "ethena",
  "jupiter",
];

export const revalidate = 30;

export async function GET() {
  try {
    const ids = COINS.join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
