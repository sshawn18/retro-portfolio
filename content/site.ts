/**
 * SITE CONTENT — single source of truth.
 * Edit these values to personalize the portfolio.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle?: string;
};

export type SiteConfig = {
  /** Displayed in the Welcome window + My Computer */
  name: string;
  /** Short handle — shown in Start menu and window titles */
  handle: string;
  /** Single-line tagline */
  tagline: string;
  /** Short role / location line */
  role: string;
  /** Paragraphs in the About.txt / Welcome window */
  bio: string[];
  /** Primary email for the Contact dialog */
  email: string;
  /** LinkedIn profile URL */
  linkedin: string;
  /** Socials listed in Contact.exe */
  socials: SocialLink[];
  /** Credit line — shown in Welcome window */
  credit: string;
  /** Letterboxd username used by the Film Diary window. Public handle — not a secret. */
  letterboxdUsername: string;
  /** AniList username used by the Anime List window. Public handle — not a secret. */
  anilistUsername: string;
};

export const site: SiteConfig = {
  name: "Ravi Gupta",
  handle: "ravi",
  tagline: "MBA student · E-commerce builder · Based in Kyoto.",
  role: "Shopify Manager · Founder · Developer",
  bio: [
    "Welcome to my personal computer.",
    "I'm Ravi — currently doing my MBA at Doshisha Business School in Kyoto, Japan. Before that I ran a cloud kitchen startup, managed Shopify stores, and somehow found time to build a full-stack kanji learning app.",
    "I like making things work on the internet. Open a window to see what I've been up to.",
  ],
  email: "raviigupta21@gmail.com",
  linkedin: "https://www.linkedin.com/in/ravi-gupta-46a43a175",
  socials: [
    { label: "GitHub", href: "https://github.com/sshawn18", handle: "@sshawn18" },
    { label: "AniList", href: "https://anilist.co/user/SHAWN18", handle: "@SHAWN18" },
    { label: "Letterboxd", href: "https://letterboxd.com/SHAWN_18/", handle: "@SHAWN_18" },
    { label: "KanjiLearn", href: "https://kanjilearn.vercel.app", handle: "kanjilearn.vercel.app" },
  ],
  credit: "Hand-built with Next.js + 98.css.",
  letterboxdUsername: "SHAWN_18",
  anilistUsername: "SHAWN18",
};
