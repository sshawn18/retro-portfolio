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
  /** Single-line professional tagline — used for the page meta description */
  tagline: string;
  /** Main title shown in bold in the Welcome window */
  headline: string;
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
  /** Last.fm username linked from the taskbar. Public handle — not a secret. */
  lastfmUsername: string;
};

export const site: SiteConfig = {
  name: "Ravi Gupta",
  handle: "ravi",
  tagline: "Digital Marketing & E-Commerce | Shopify, SEO, Paid Ads & AI Workflow Automation | MBA - Doshisha, Japan | EN / HI / JP (N4)",
  headline: "An individual who wants to try all sports and forms of media",
  role: "Kyoto, Japan",
  bio: [
    "Welcome to my personal computer.",
    "I am Ravi/Nikhil/Nik. I'm originally from India and now live in Kyoto, Japan. I recently finished my MBA at Doshisha University.",
    "What I want most is to make something exist in the world. During my bachelor's degree, I thought I'd become a writer, but it never clicked. So I started my own business. I was super passionate about it, but circumstances forced me to close it.",
    "Every day I try to get the best out of myself and use every fiber of my body to the fullest. I go to the gym so I can see myself in good shape one day, and I try all kinds of sports to feel what it's like to sweat and win in each of them.",
    "I love exploring fiction, and movies are my favourite way to do it. Cinema is where I feel most like myself. It opens up parts of my brain that nothing else can.",
    "I don't specialize in any one art, but I think of myself as a creative person. I like to create in every way I can: taking photos and videos, drawing, expressing myself to friends, working on projects, or just daydreaming. Whenever I see people who are passionate about their art, it inspires me a lot, and I hope to be passionate about something myself one day.",
    "Someday I'd like to learn to play the piano. Open a window to see what I've been up to.",
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
  lastfmUsername: "SHAWN_18",
};
