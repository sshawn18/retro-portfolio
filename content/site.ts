/**
 * SITE CONTENT — single source of truth.
 * Edit these values to personalize the portfolio.
 * Anything marked TODO should be replaced before showing the site publicly.
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
  // TODO: replace with your real name
  name: "Your Name",
  handle: "you",
  tagline: "Builder of small, strange, well-made software.",
  role: "Developer · Designer · Occasional writer",
  bio: [
    "Welcome to my personal computer.",
    // TODO: rewrite these paragraphs to be about you
    "Hi. I'm a developer who likes the texture of old computing — chunky buttons, fixed-width type, the reassuring sound of a hard drive seeking. This site is equal parts portfolio, journal, and personal dashboard.",
    "By day I build web things. By night I'm usually listening to something on Spotify, halfway through a film on Letterboxd, or trying (and failing) to beat my last Hevy PR.",
    "Double-click an icon on the desktop to open something. More modules coming soon.",
  ],
  email: "hello@example.com",
  socials: [
    { label: "GitHub", href: "https://github.com/", handle: "@you" },
    { label: "Twitter", href: "https://twitter.com/", handle: "@you" },
    { label: "Letterboxd", href: "https://letterboxd.com/SHAWN_18/", handle: "@SHAWN_18" },
    { label: "Read.cv", href: "https://read.cv/", handle: "@you" },
  ],
  credit: "Hand-built with Next.js + 98.css.",
  letterboxdUsername: "SHAWN_18",
  anilistUsername: "SHAWN18",
};
