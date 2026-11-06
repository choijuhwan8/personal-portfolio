export type Experience = {
  org: string;
  role: string;
  period: string;
  location: string;
  kind: "work" | "leadership" | "service";
  points: string[];
};

export const PORTFOLIO_DATA = {
  name: "Juhwan Choi",
  shortName: "Juhwan",
  headline: "Clear thinking for complex markets.",
  role: "Information Systems · Singapore Management University",
  location: "Singapore · Seoul",
  email: "choijuhwan8@gmail.com",
  statement:
    "Information Systems undergraduate with experience across financial services, venture building and technology. I enjoy client-facing work, turning complex data into insights people can act on. Bilingual in Korean and English.",
  intro:
    "I'm a final-year Information Systems student at SMU. I've worked in equity capital markets, startup selection and partnerships, and frontend engineering. I'm now looking for client-facing roles in financial services and markets, where clear communication matters as much as the analysis.",
  availability: "Open to graduate and internship roles in financial services, 2027",

  socials: [
    { label: "LinkedIn", handle: "in/juhwan-choi", url: "https://www.linkedin.com/in/juhwan-choi/" },
    { label: "Email", handle: "choijuhwan8@gmail.com", url: "mailto:choijuhwan8@gmail.com" },
    { label: "GitHub", handle: "choijuhwan8", url: "https://github.com/choijuhwan8" },
  ],

  stats: [
    { value: 100, suffix: "+", label: "Startup applications assessed against a 12-point framework" },
    { value: 100, prefix: "~", label: "Hackathon participants across SMU, NUS and NTU" },
    { value: 3, label: "Internships across capital markets, venture and tech" },
    { value: 2, label: "Working languages: Korean (native) and English (fluent)" },
  ],

  pillars: [
    {
      n: "01",
      title: "Client & stakeholder management",
      body: "I've been the main contact between a corporate partner and its startups, sorting out competing priorities and keeping a multi-party programme on schedule.",
    },
    {
      n: "02",
      title: "Markets & research",
      body: "I've done IPO research and peer valuation benchmarking for an ECM desk, and compared regulatory regimes across jurisdictions to support firm-wide decisions.",
    },
    {
      n: "03",
      title: "Technology fluency",
      body: "With a background in Information Systems and software engineering, I can talk with product and tech teams and bring data-driven tools to client work.",
    },
  ],

  experience: [
    {
      org: "Tenity",
      role: "Strategy & Operations Analyst Intern",
      period: "Aug 2026 — Present",
      location: "Singapore",
      kind: "work",
      points: [
        "Evaluated 100+ startup applicants for the SFIIP accelerator using a 12-point framework covering team, traction, market, technology and fundraising readiness, and helped select the final five.",
        "Acted as primary liaison between the corporate partner and participating startups, aligning expectations and coordinating arrangements so the programme ran smoothly.",
        "Represented Tenity at Singapore FinTech Festival, IR days and hackathons, sourcing high-potential startups and expanding the partner network.",
      ],
    },
    {
      org: "Mirae Asset Securities",
      role: "Equity Capital Markets & Digital Assets Intern",
      period: "Aug 2025 — Nov 2025",
      location: "Singapore",
      kind: "work",
      points: [
        "Carried out end-to-end IPO research and peer benchmarking across regional and global markets to evaluate comparable listing valuations.",
        "Supported the ECM team in refining deal positioning and strategy.",
        "Analysed licensing, custody and compliance regimes across key jurisdictions to reduce legal risk and inform firm-wide initiatives.",
      ],
    },
    {
      org: "Korean Student Association of SMU",
      role: "Events Director",
      period: "Aug 2025 — Nov 2026",
      location: "Singapore",
      kind: "leadership",
      points: [
        "Co-founded and led Builderthon, a flagship AI hackathon, owning strategy, sponsorships and VC partnerships for ~100 participants.",
        "Planned, budgeted and ran large-scale networking events, from welcome mixers to alumni sessions.",
      ],
    },
    {
      org: "Republic of Korea Army",
      role: "Personnel Specialist, 3rd Infantry Division",
      period: "Nov 2023 — May 2025",
      location: "South Korea",
      kind: "service",
      points: [
        "Managed personnel administration for a company of ~100 soldiers, acting as liaison between soldiers and command with accuracy and compliance under strict deadlines.",
      ],
    },
    {
      org: "Alpha Impact",
      role: "Software Engineer Intern",
      period: "Mar 2023 — Jul 2023",
      location: "Singapore",
      kind: "work",
      points: [
        "Built responsive web applications for a retail trading platform in React and TypeScript, improving engagement and retention.",
        "Designed intuitive trader-facing interfaces and worked in Agile sprints with cross-functional teams.",
      ],
    },
  ] as Experience[],

  education: [
    { school: "Singapore Management University", detail: "BSc, Information Systems", period: "Expected May 2027", location: "Singapore" },
    { school: "Korea University", detail: "Winter School: Introduction to Machine Learning", period: "Dec 2025 — Jan 2026", location: "South Korea" },
  ],

  skills: ["Client relationship", "Risk analysis", "Excel & PowerPoint", "Equity research", "AI-assisted prototyping", "Prompt engineering"],
  languages: [
    { name: "Korean", level: "Native" },
    { name: "English", level: "Fluent" },
    { name: "Mandarin", level: "Beginner" },
  ],
  certificates: ["Basic Insurance Concepts and Principles (BCP)", "Product Management (Udemy)"],
};
