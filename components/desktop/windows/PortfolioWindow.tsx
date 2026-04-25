"use client";

import { useState } from "react";

/* ── Types ──────────────────────────────────────────────────── */

type Tab = "experience" | "education" | "projects" | "skills";

/* ── Data ───────────────────────────────────────────────────── */

const experience = [
  {
    title: "Freelance E-Commerce & Shopify Manager",
    org: "Self-employed",
    period: "Jan 2021 – Present",
    location: "Remote",
    bullets: [
      "Manage Shopify storefronts end-to-end — theme customisation, product listings, apps & integrations.",
      "Run Google Ads and SEO campaigns; drive measurable revenue growth for clients.",
      "Handle inventory, supplier coordination and day-to-day operations for multiple stores.",
    ],
  },
  {
    title: "Founder & Operations Manager",
    org: "Cloud Kitchen Startup",
    period: "May 2023 – Aug 2024",
    location: "Delhi, India",
    bullets: [
      "Launched and operated a cloud kitchen from scratch, reaching 500+ orders.",
      "Managed full P&L, kitchen staff, delivery logistics, and customer service.",
      "Built ordering flow using WhatsApp Business and Zomato / Swiggy listings.",
    ],
  },
  {
    title: "Customer Support Coordinator",
    org: "Snackat — UAE",
    period: "Feb 2021 – Oct 2023",
    location: "Remote",
    bullets: [
      "First point of contact for customer queries across email, chat, and social channels.",
      "Collaborated with operations team to resolve order issues and improve SLA.",
    ],
  },
];

const education = [
  {
    degree: "MBA — Master of Business Administration",
    school: "Doshisha Business School",
    location: "Kyoto, Japan",
    period: "2024 – 2026",
    detail: "GPA 3.6 / 4.0  ·  Focus: International Business & Entrepreneurship",
  },
  {
    degree: "BCom Honours — Commerce",
    school: "University of Delhi",
    location: "Delhi, India",
    period: "2019 – 2023",
    detail: "Core subjects: Financial Accounting, Business Law, Economics, Marketing",
  },
];

const projects = [
  {
    name: "KanjiLearn",
    url: "https://kanjilearn.vercel.app",
    stack: "Next.js · TypeScript · PostgreSQL · AI",
    desc: "Full-stack spaced-repetition system (SRS) for learning Japanese kanji. Built entirely with Claude AI assistance. Features adaptive review scheduling, stroke-order animations, and progress tracking.",
    status: "Live",
  },
  {
    name: "retro-portfolio",
    url: "https://raviguptacc.vercel.app",
    stack: "Next.js · TypeScript · 98.css · Tailwind",
    desc: "This site! A Windows 98-style personal desktop with live Spotify, Letterboxd, and AniList integrations. Draggable windows, Start menu, and CRT intro screen.",
    status: "Live",
  },
];

const skillGroups = [
  {
    label: "E-Commerce & Business Development",
    skills: ["Shopify (Store Setup, Themes, Apps)", "Google Ads / PPC", "SEO / SEM", "Digital Marketing", "Business Development", "Zomato / Swiggy Listings"],
  },
  {
    label: "AI Tools & Automation",
    skills: ["AI Fluency (ChatGPT, Claude, Gemini)", "AI Workflow Automation", "Zapier / Make (Integromat)", "Prompt Engineering", "AI Content & Copywriting", "AI-assisted Research"],
  },
  {
    label: "Design & Productivity",
    skills: ["Canva", "MS Office (Excel, Word, PowerPoint)", "WhatsApp Business API", "Notion"],
  },
  {
    label: "Languages",
    skills: ["English (Fluent)", "Hindi (Native)", "Japanese (JLPT N4)"],
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
          MBA Student · Shopify Manager · Developer
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
                  {job.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 11, marginBottom: 3 }}>
                      <Dot />
                      {b}
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
                Year 1 of MBA at Doshisha Business School
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                <Dot />
                Studying Japanese — sitting JLPT N3 this December
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                <Dot />
                Building KanjiLearn and freelancing on the side
              </div>
            </div>
          </SectionBox>
        )}

        {tab === "projects" && (
          <SectionBox>
            {projects.map((p, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < projects.length - 1 ? 16 : 0,
                  paddingBottom: i < projects.length - 1 ? 16 : 0,
                  borderBottom:
                    i < projects.length - 1 ? "1px dashed #c0c0c0" : "none",
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
                  <span
                    style={{
                      fontSize: 9,
                      padding: "1px 5px",
                      background: "#008000",
                      color: "#fff",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 5 }}>
                  {p.stack}
                </div>
                <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.5 }}>
                  {p.desc}
                </div>
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
