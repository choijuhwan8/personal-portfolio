/**
 * Fetches today's financial markets news via Claude and writes to Firestore.
 * Run: node scripts/fetch-news.js
 */

const admin = require("firebase-admin");
const https = require("https");
const path = require("path");
const fs = require("fs");

// load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
        const [k, ...v] = line.split("=");
        if (k && v.length) process.env[k.trim()] = v.join("=").trim();
    });
}

// ── Firebase init ─────────────────────────────────────────────────────────────
const serviceAccount = require(path.join(__dirname, "../service-account.json"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Claude API call ───────────────────────────────────────────────────────────
function callClaude(prompt) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 8192,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: prompt }],
        });

        const req = https.request({
                hostname: "api.anthropic.com",
                path: "/v1/messages",
                method: "POST",
                headers: {
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(body),
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                });
            }
        );
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

// ── Selection logic: pick 6 from 12 by significance + category priority ───────
function selectSix(items) {
    const sorted = (cat) => items
        .filter((i) => i.category === cat)
        .sort((a, b) => (b.significance || 0) - (a.significance || 0));

    const selected = [];
    const used = new Set();

    const pick = (item) => {
        if (!item || used.has(item)) return false;
        selected.push(item);
        used.add(item);
        return true;
    };

    // 1. Best EQUITIES article, 2nd if significance >= 7
    const equities = sorted("EQUITIES");
    pick(equities[0]);
    if (equities[1] && (equities[1].significance || 0) >= 7) pick(equities[1]);

    // 2. Best MACRO, RATES and FX
    pick(sorted("MACRO")[0]);
    pick(sorted("RATES")[0]);
    pick(sorted("FX")[0]);

    // 4. Fill remaining slots with highest significance overall
    const remaining = [...items]
        .filter((i) => !used.has(i))
        .sort((a, b) => (b.significance || 0) - (a.significance || 0));

    for (const item of remaining) {
        if (selected.length >= 6) break;
        pick(item);
    }

    return selected;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const today = new Date().toISOString().slice(0, 10);
    console.log(`Fetching markets news for ${today}...`);

    // ── Step 1: cover image (skipped at low API tier — SVG fallback used) ────
    const coverImage = "";

    // ── Step 2: fetch 12 news articles ───────────────────────────────────────
    const prompt = `You are a markets analyst at an investment bank writing a daily client digest. Today is ${today}.

Search the web for today's top financial markets news, with attention to Asia (Singapore, Korea, Japan, Hong Kong) as well as the US. Use multiple search queries: "stock market news ${today}", "Asia markets ${today}", "Federal Reserve ${today}", "bond yields ${today}", "currency markets ${today}", "IPO news ${today}", "MAS OR Bank of Korea ${today}". Do not include cryptocurrency or blockchain stories. Read each article carefully before writing about it.

For each story, write your own curated analysis — do not copy the headline or lede verbatim. Write like a knowledgeable analyst explaining what happened and why it matters.

After searching and reading, respond with ONLY a raw JSON array — no explanation, no markdown fences, no preamble. Start your response with [ and end with ].

Format:
[
  {
    "title": "your own punchy headline (not copied verbatim from the article, max 12 words)",
    "summary": "2-3 sentence curated summary. What happened, why it matters, what to watch.",
    "body": "4-6 sentence deeper analysis. Context, implications, relevant background, market impact. Plain text only, no markdown, no emoji, no <cite> tags.",
    "url": "direct permalink to the specific article page (must include a path, not just the domain root — e.g. https://www.reuters.com/markets/asia/article-slug not https://www.reuters.com/)",
    "source": "publication name e.g. Reuters, Bloomberg, Financial Times, The Business Times, Nikkei Asia",
    "date": "${today}",
    "category": "one of: EQUITIES | RATES | FX | COMMODITIES | MACRO | POLICY",
    "significance": "integer 1-10, your assessment of market importance (10 = major market-moving event)",
    "imageUrl": "a direct image URL from the article ending in .jpg .jpeg .png or .webp if one is available, otherwise empty string"
  }
]

Aim for exactly 12 items. Cover a mix of all categories. Prioritize stories with real market significance. Avoid low-quality PR pieces.

IMPORTANT: Your entire response must be valid JSON starting with [ and nothing else before it.`;

    const response = await callClaude(prompt);

    const textBlocks = (response.content || []).filter((b) => b.type === "text");
    const textBlock = textBlocks[textBlocks.length - 1];
    if (!textBlock) {
        console.error("No text block in response:", JSON.stringify(response, null, 2));
        process.exit(1);
    }

    let raw = textBlock.text.trim();
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const match = raw.match(/(\[[\s\S]*\])/);
    if (match) raw = match[1];

    let allItems;
    try {
        allItems = JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse JSON:\n", raw);
        process.exit(1);
    }

    if (!Array.isArray(allItems) || allItems.length === 0) {
        console.error("Empty or invalid items array");
        process.exit(1);
    }

    console.log(`  Parsed ${allItems.length} articles, selecting 6...`);

    // ── Step 3: select 6 by significance + category priority ─────────────────
    const selected = selectSix(allItems);

    // ── Step 4: write to Firestore ────────────────────────────────────────────
    const batch = db.batch();
    for (const item of selected) {
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
        const docId = `${today}-${slug}`;
        const ref = db.collection("news").doc(docId);
        const cleanBody = (item.body || "").replace(/<cite[^>]*>|<\/cite>/g, "");

        // imageUrl: use article image if valid, else fall back to coverImage
        const articleImage = (item.imageUrl || "").trim();
        const isValidUrl = /^https?:\/\/\S+\.(jpg|jpeg|png|webp)/i.test(articleImage);
        const imageUrl = isValidUrl ? articleImage : coverImage;

        // reject root-domain URLs like https://coindesk.com/ — no real article path
        const rawUrl = (item.url || "").trim();
        const isSpecificUrl = /^https?:\/\/[^/]+\/.+/.test(rawUrl);
        const articleUrl = isSpecificUrl ? rawUrl : "";

        batch.set(ref, {
            title: item.title || "",
            summary: item.summary || "",
            body: cleanBody,
            url: articleUrl,
            source: item.source || "",
            date: today,
            category: item.category || "",
            significance: Number(item.significance) || 5,
            imageUrl: imageUrl || "",
            beat: "markets",
        }, { merge: true });

        console.log(`  ✓ [${item.category}][${item.significance}] ${item.title.slice(0, 55)}`);
    }

    await batch.commit();

    // store daily meta
    if (coverImage) {
        await db.collection("news_meta").doc(today).set({ coverImage, date: today }, { merge: true });
    }

    console.log(`\nDone — ${selected.length} items written to Firestore (selected from ${allItems.length}).`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});