"use client";

import { useState } from "react";

/* ── Types ──────────────────────────────────────────────────── */

type Tab = "experience" | "education" | "projects" | "skills";

/* ── Data ───────────────────────────────────────────────────── */

/** Bullets are [bold lead, text] pairs, as on the resume. */
const experience: {
  title: string;
  org: string;
  period: string;
  location: string;
  bullets: [string, string][];
}[] = [
  {
    title: "Digital Marketing & Operations Contractor",
    org: "Matcha Tourism",
    period: "Sep 2026 – Present",
    location: "Kyoto, Japan",
    bullets: [
      ["Direct-channel strategy", "Moved bookings from third-party OTAs to the company's own website through direct-channel advertising, saving JPY 12,000 in OTA commission per booking."],
      ["OTA channel optimization", "Reviewed listings across multiple OTA channels to improve reach."],
      ["KPI and campaign reporting", "Produce regular reports for management on channel results, conversion and marketing campaign outcomes using Google Analytics."],
      ["AI-assisted development", "Built a custom WordPress booking plugin with Claude Code to replace JTB Bokun for website bookings."],
    ],
  },
  {
    title: "Founder",
    org: "Homemade Paratha (Cloud Kitchen)",
    period: "May 2023 – Aug 2024",
    location: "New Delhi, India",
    bullets: [
      ["Customer acquisition", "Built customer acquisition from zero through Swiggy and Zomato promotions and social media advertising; scaled to 500+ orders and INR 200,000 per month at peak."],
      ["Social media and paid advertising", "Ran social media marketing and paid advertising campaigns and managed the promotional calendar and pricing."],
      ["Operations and retention", "Managed end-to-end operations, product and menu management and customer retention."],
      ["Vendor negotiation", "Negotiated with vendors and suppliers to control costs and supply."],
    ],
  },
  {
    title: "Business Development Associate",
    org: "Snackat",
    period: "Feb 2021 – Oct 2023",
    location: "Delhi, India · Remote",
    bullets: [
      ["Client outreach", "Managed a 25-client portfolio for a UAE-based consumer brand over 2.5 years, including email outreach and client relationships."],
      ["Email marketing and CRM", "Developed and ran marketing and email campaigns and managed customer relationships (CRM)."],
      ["Market research and lead generation", "Researched client and market sectors to identify new leads; presented findings to management in monthly reports."],
      ["E-commerce operations", "Managed the product catalogue, listings and daily e-commerce website operations."],
      ["Cross-functional work", "Worked cross-functionally with other teams across the business on client, marketing and website work."],
    ],
  },
];

const education = [
  {
    degree: "MBA — Global Business and Management",
    school: "Doshisha Business School",
    location: "Kyoto, Japan",
    period: "2024 – 2026",
    detail: "GPA 3.6 / 4.0",
  },
  {
    degree: "BCom Honours — Commerce",
    school: "University of Delhi",
    location: "Delhi, India",
    period: "2019 – 2023",
    detail: "Core subjects: Financial Accounting, Business Law, Economics, Marketing",
  },
];

const statusColors = {
  Live: "#008000",
  "In progress": "#808000",
} as const;

type Project = {
  name: string;
  url?: string;
  meta: string;
  desc: string;
  /** Only personal projects carry a status badge. */
  status?: keyof typeof statusColors;
};

const projectSections: { label: string; items: Project[] }[] = [
  {
    label: "Freelance",
    items: [
      {
        name: "Otakustitch",
        meta: "Website & E-Commerce Manager · Nov 2022 – Present · Remote, UAE-based brand",
        desc: "Built the brand's Shopify store from scratch for a business with no prior online presence. Ran SEO, social media, email and paid campaigns (Google Ads, Meta Ads, X Ads) as a one-person team, growing annual revenue from $20K to $110K in the first year and expanding online sales into the USA and Europe. Used GA4 for store analytics and AI tools (Claude Code, Codex) for custom automation and site features.",
      },
      {
        name: "Kats Footwear",
        meta: "E-Commerce & SEO Consultant · Mar 2024 – Present · Remote",
        desc: "Rebuilt an underperforming Shopify store for a footwear brand selling through retail and B2B channels. SEO improvements, content strategy and promotional campaigns doubled organic traffic (+100%) in 2 months; ran paid campaigns and tracked performance in GA4.",
      },
    ],
  },
  {
    label: "Personal projects",
    items: [
      {
        name: "KanjiLearn",
        url: "https://kanjilearn.vercel.app",
        meta: "Next.js · TypeScript · PostgreSQL · AI",
        desc: "Full-stack spaced-repetition system (SRS) for learning Japanese kanji. Built entirely with Claude AI assistance. Features adaptive review scheduling, stroke-order animations, and progress tracking.",
        status: "Live",
      },
      {
        name: "CashBook",
        url: "https://cashbook-app-one.vercel.app",
        meta: "React · Vite · Tailwind CSS · Express · PostgreSQL (Neon)",
        desc: "A mobile-first cash flow tracker for small businesses and freelancers. Record a cash entry in under 5 seconds, with multiple books, a parties ledger, categories, reports and data backup. Email and password accounts with JWT, and every book is scoped to its owner.",
        status: "Live",
      },
      {
        name: "retro-portfolio",
        url: "https://raviguptacc.vercel.app",
        meta: "Next.js · TypeScript · 98.css · Tailwind",
        desc: "This site! A Windows 98-style personal desktop with live Spotify, Letterboxd, and AniList integrations. Draggable windows, Start menu, and CRT intro screen.",
        status: "Live",
      },
      {
        name: "FilterCam",
        meta: "Android · Kotlin · Jetpack Compose · CameraX · OpenGL ES",
        desc: "A native Android camera app with hand-tuned filters. A GPU shader gives a live filtered preview and processes the saved photos, and you can tune, import, rename, share and export your own filters. The first preset, Jade, is a green film look with warm skin tones.",
        status: "In progress",
      },
    ],
  },
  {
    label: "Internships",
    items: [
      {
        name: "OTA & Reservations Intern",
        meta: "Matcha Tourism · Jan 2026 – Feb 2026 · Kyoto, Japan",
        desc: "Assisted market research and planning for the company's new luxury tourism package priced at JPY 1 million, and coordinated with the creative, planning and finance teams.",
      },
      {
        name: "HR Intern",
        meta: "ONE DEJIMA · Nagasaki, Japan",
        desc: "Designed and pitched a candidate-outreach framework with a cross-functional team; the proposal ranked 1st among all teams.",
      },
    ],
  },
];

const certifications = [
  "Business Analysis and Process Management",
  "Shopify E-Commerce",
  "Mailchimp Email Marketing (2023)",
  "JLPT N4",
];

const skillGroups = [
  {
    label: "Marketing",
    skills: ["Digital Marketing", "SEO", "Paid Advertising", "Google Ads (SEM)", "Meta Ads", "X (Twitter) Ads", "Social Media Marketing", "Email Marketing", "Mailchimp", "Content Strategy", "A/B Testing", "Campaign Management", "Customer Acquisition", "PR & Events Support"],
  },
  {
    label: "Analytics & Research",
    skills: ["Google Analytics (GA4)", "KPI Reporting", "Marketing Analytics", "Market Research", "International Market Expansion"],
  },
  {
    label: "E-Commerce & Operations",
    skills: ["Shopify", "WordPress", "E-Commerce Operations", "CRM Software", "Client Relationships", "Cross-functional Collaboration", "Cross-team Coordination"],
  },
  {
    label: "AI & Automation",
    skills: ["Claude Code", "Claude", "ChatGPT", "AI-assisted Development", "Workflow Automation"],
  },
  {
    label: "Design & Productivity",
    skills: ["Canva", "MS Office"],
  },
  {
    label: "Languages",
    skills: ["English (Fluent)", "Hindi (Native)", "Japanese (JLPT N4, preparing for N3)"],
  },
];

/* ── Sub-components ─────────────────────────────────────────── */

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        position: "relative",
        padding: "3px 12px",
        marginRight: 2,
        background: active ? "#c0c0c0" : "#bdbdbd",
        border: "1px solid",
        borderColor: active
          ? "#fff #808080 transparent #fff"
          : "#fff #808080 #808080 #fff",
        borderBottomColor: active ? "#c0c0c0" : "#808080",
        fontFamily: "inherit",
        fontSize: 11,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        top: active ? 0 : 1,
        zIndex: active ? 2 : 1,
        boxShadow: "none",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {label}
    </button>
  );
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid",
        borderColor: "#808080 #fff #fff #808080",
        background: "#fff",
        padding: "10px 12px",
        overflowY: "auto",
        maxHeight: 360,
      }}
    >
      {children}
    </div>
  );
}

function Dot() {
  return <span style={{ color: "#808080", marginRight: 6 }}>▸</span>;
}

/* ── Main component ─────────────────────────────────────────── */

export function PortfolioWindow() {
  const [tab, setTab] = useState<Tab>("experience");

  return (
    <div style={{ fontFamily: "var(--font-plex-mono), monospace", fontSize: 12, lineHeight: 1.6 }}>
      {/* Header card */}
      <div
        style={{
          border: "1px solid",
          borderColor: "#808080 #fff #fff #808080",
          background: "#000080",
          color: "#fff",
          padding: "10px 14px",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.04em" }}>
          RAVI GUPTA
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
          MBA Graduate · E-Commerce &amp; Digital Marketing · Developer
        </div>
        <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4 }}>
          📍 Kyoto, Japan &nbsp;·&nbsp; ✉️{" "}
          <a
            href="mailto:raviigupta21@gmail.com"
            style={{ color: "#a0c8ff", textDecoration: "none" }}
          >
            raviigupta21@gmail.com
          </a>
          &nbsp;·&nbsp; 🌐{" "}
          <a
            href="https://kanjilearn.vercel.app"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#a0c8ff", textDecoration: "none" }}
          >
            kanjilearn.vercel.app
          </a>
        </div>
      </div>

      {/* Tab strip */}
      <menu role="tablist" className="flex gap-0 mb-0 list-none p-0">
        {(
          [
            { id: "experience", label: "💼 Experience" },
            { id: "education", label: "🎓 Education" },
            { id: "projects", label: "🚀 Projects" },
            { id: "skills", label: "🛠️ Skills" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <TabBtn
            key={t.id}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
            label={t.label}
          />
        ))}
      </menu>

      {/* Panel */}
      <div
        style={{
          border: "1px solid",
          borderColor: "#fff #808080 #808080 #fff",
          background: "#c0c0c0",
          padding: "10px 12px",
          marginTop: -1,
        }}
      >
        {tab === "experience" && (
          <SectionBox>
            {experience.map((job, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < experience.length - 1 ? 16 : 0,
                  paddingBottom: i < experience.length - 1 ? 16 : 0,
                  borderBottom:
                    i < experience.length - 1 ? "1px dashed #c0c0c0" : "none",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12 }}>{job.title}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#000080",
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  {job.org}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    marginBottom: 6,
                  }}
                >
                  {job.period} · {job.location}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {job.bullets.map(([lead, text], j) => (
                    <li key={j} style={{ fontSize: 11, marginBottom: 3 }}>
                      <Dot />
                      <b>{lead}:</b> {text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </SectionBox>
        )}

        {tab === "education" && (
          <SectionBox>
            {education.map((ed, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < education.length - 1 ? 16 : 0,
                  paddingBottom: i < education.length - 1 ? 16 : 0,
                  borderBottom:
                    i < education.length - 1 ? "1px dashed #c0c0c0" : "none",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12 }}>{ed.degree}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#000080",
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  {ed.school}
                </div>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 4 }}>
                  {ed.period} · {ed.location}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{ed.detail}</div>
              </div>
            ))}
            {/* Currently section */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px dashed #c0c0c0",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                🟢 Currently
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                <Dot />
                Digital marketing &amp; operations at Matcha Tourism, Kyoto
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                <Dot />
                Studying Japanese — preparing for JLPT N3
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                <Dot />
                Building KanjiLearn and freelancing for Otakustitch &amp; Kats Footwear
              </div>
            </div>
            {/* Certifications section */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px dashed #c0c0c0",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                📜 Certifications
              </div>
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11, opacity: 0.85 }}>
                  <Dot />
                  {c}
                </div>
              ))}
            </div>
          </SectionBox>
        )}

        {tab === "projects" && (
          <SectionBox>
            {projectSections.map((section, s) => (
              <div key={section.label} style={{ marginTop: s > 0 ? 20 : 0 }}>
                {/* Section heading */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                    marginBottom: 10,
                    paddingBottom: 3,
                    borderBottom: "1px solid #808080",
                  }}
                >
                  {section.label}
                </div>
                {section.items.map((p, i) => (
                  <div
                    key={p.name}
                    style={{
                      marginBottom: i < section.items.length - 1 ? 16 : 0,
                      paddingBottom: i < section.items.length - 1 ? 16 : 0,
                      borderBottom:
                        i < section.items.length - 1 ? "1px dashed #c0c0c0" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#000080",
                            textDecoration: "underline",
                          }}
                        >
                          {p.name}
                        </a>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                      )}
                      {p.status && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            background: statusColors[p.status],
                            color: "#fff",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {p.status}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 5 }}>
                      {p.meta}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </SectionBox>
        )}

        {tab === "skills" && (
          <SectionBox>
            {skillGroups.map((group, i) => (
              <div key={i} style={{ marginBottom: i < skillGroups.length - 1 ? 14 : 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: 0.5,
                    marginBottom: 5,
                  }}
                >
                  {group.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {group.skills.map((s, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        border: "1px solid",
                        borderColor: "#808080 #fff #fff #808080",
                        background: "#e4e0d8",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </SectionBox>
        )}
      </div>

      {/* Status bar */}
      <div className="status-bar mt-2">
        <p className="status-bar-field">Ravi Gupta — Kyoto, Japan</p>
        <p className="status-bar-field">
          <a
            href="https://github.com/sshawn18"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            github.com/sshawn18
          </a>
        </p>
      </div>
    </div>
  );
}
