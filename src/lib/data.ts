export const PORTFOLIO_DATA = {
  name: "CHOI JUHWAN",
  handle: "@choi88888",
  role: "Independent researcher & builder",
  bio: "Final year Information Systems student at SMU, working my way into the crypto industry. Particularly drawn to tokenisation and stablecoins — the parts of crypto that feel closest to reshaping how money actually moves.",
  location: "Singapore / Seoul / remote",
  email: "choijuhwan8@gmail.com",
  socials: [
    { label: "GITHUB",   handle: "github.com/choijuhwan8",          url: "https://github.com/choijuhwan8" },
    { label: "X",        handle: "x.com/choijuhwan2",               url: "https://x.com/choijuhwan2" },
    { label: "LINKEDIN", handle: "linkedin.com/in/juhwan-choi",     url: "https://www.linkedin.com/in/juhwan-choi/" },
    { label: "TELEGRAM", handle: "@choi88888",                      url: "https://t.me/choi88888" },
    { label: "EMAIL",    handle: "choijuhwan8@gmail.com",           url: "mailto:choijuhwan8@gmail.com" },
  ],
  now: [] as string[],
  projects: [] as {
    name: string; status: string; version: string; url: string;
    summary: string; stack: string[]; metric: { label: string; value: string };
  }[],
  experience: [
    { period: "AUG — NOV 2025", org: "MIRAE ASSET SECURITIES SINGAPORE", role: "Equity Capital Markets & Digital Assets Intern", note: "IPO research and pitchbook prep for ECM team. Led stablecoin strategy work — regulatory landscape analysis and a USD/SGD-pegged issuance roadmap covering compliance, custody, and infrastructure." },
    { period: "MAR — JUL 2023", org: "ALPHA IMPACT",                      role: "Software Engineer Intern",                       note: "Built and shipped features on a crypto copy trading platform. React, TypeScript, UI/UX. Worked across the full frontend stack in an agile team." },
    { period: "2021 — 2027",    org: "SMU",                               role: "BSc, Information Systems",                       note: "" },
  ],
};
