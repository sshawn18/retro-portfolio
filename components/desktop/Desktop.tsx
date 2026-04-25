"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Computer,
  Notepad,
  Folder,
  CdMusic,
  Wordpad,
  Mail,
  RecycleEmpty,
  Mplayer11,
  Winmine1,
} from "@react95/icons";
import type { DesktopWindow, WindowId } from "@/lib/desktop-types";
import { DesktopIcon } from "./DesktopIcon";
import { Win98Window } from "./Win98Window";
import { Taskbar } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { AboutWindow } from "./windows/AboutWindow";
import { MyComputerWindow } from "./windows/MyComputerWindow";
import { ContactWindow } from "./windows/ContactWindow";
import { NowPlayingWindow } from "./windows/NowPlayingWindow";
import { LetterboxdWindow } from "./windows/LetterboxdWindow";
import { AnilistWindow } from "./windows/AnilistWindow";
import { PortfolioWindow } from "./windows/PortfolioWindow";
import { SoonWindow } from "./windows/SoonWindow";
import { RecycleWindow } from "./windows/RecycleWindow";
import { site } from "@/content/site";

/** Shared sizing for the 32px Win98 icons so they stay crisp. */
const iconStyle = {
  width: 36,
  height: 36,
  imageRendering: "pixelated",
} as const;

/* ── Window definitions ────────────────────────────────────── */

type Template = Omit<DesktopWindow, "z" | "minimized">;

const templates: Record<WindowId, Template> = {
  welcome: {
    id: "welcome",
    title: "Welcome",
    icon: "👋",
    x: 120,
    y: 60,
    width: 440,
    content: <AboutWindow />,
  },
  about: {
    id: "about",
    title: "About.txt — Notepad",
    icon: "📄",
    x: 180,
    y: 120,
    width: 460,
    content: <AboutWindow />,
  },
  mycomputer: {
    id: "mycomputer",
    title: "My Computer",
    icon: "🖥️",
    x: 240,
    y: 80,
    width: 420,
    content: <MyComputerWindow />,
  },
  projects: {
    id: "projects",
    title: "Projects",
    icon: "📁",
    x: 200,
    y: 100,
    width: 420,
    content: (
      <SoonWindow
        moduleName="Projects"
        description="A folder of selected case studies, experiments, and oddities. Not wired up yet — waiting for content to be added to content/projects.ts."
        glyph="📁"
      />
    ),
  },
  now: {
    id: "now",
    title: "Now Playing — Spotify",
    icon: "🎵",
    x: 220,
    y: 140,
    width: 460,
    content: <NowPlayingWindow />,
  },
  letterboxd: {
    id: "letterboxd",
    title: "Film Diary — Letterboxd",
    icon: "🎬",
    x: 260,
    y: 120,
    width: 480,
    content: <LetterboxdWindow />,
  },
  anilist: {
    id: "anilist",
    title: "Anime List — AniList",
    icon: "📺",
    x: 280,
    y: 100,
    width: 500,
    content: <AnilistWindow />,
  },
  blog: {
    id: "blog",
    title: "Blog",
    icon: "📰",
    x: 260,
    y: 160,
    width: 420,
    content: (
      <SoonWindow
        moduleName="Blog"
        description="Long-form notes on building, reading and watching. MDX pipeline not wired up yet."
        glyph="📰"
      />
    ),
  },
  contact: {
    id: "contact",
    title: "Contact.exe",
    icon: "✉️",
    x: 160,
    y: 180,
    width: 440,
    content: <ContactWindow />,
  },
  recycle: {
    id: "recycle",
    title: "Recycle Bin",
    icon: "🗑️",
    x: 300,
    y: 200,
    width: 380,
    content: <RecycleWindow />,
  },
  portfolio: {
    id: "portfolio",
    title: "Portfolio.exe — Ravi Gupta",
    icon: "📋",
    x: 160,
    y: 60,
    width: 520,
    content: <PortfolioWindow />,
  },
};

const iconOrder: { id: WindowId; label: string; glyph: ReactNode }[] = [
  { id: "mycomputer", label: "My Computer", glyph: <Computer variant="32x32_4" style={iconStyle} /> },
  { id: "portfolio",  label: "Portfolio",   glyph: <span style={{ fontSize: 32, lineHeight: 1, display: "block", textAlign: "center" }}>📋</span> },
  { id: "now",        label: "Now Playing", glyph: <CdMusic  variant="32x32_4" style={iconStyle} /> },
  { id: "letterboxd", label: "Film Diary",  glyph: <Mplayer11 variant="32x32_4" style={iconStyle} /> },
  { id: "anilist",    label: "Anime List",  glyph: <Winmine1  variant="32x32_4" style={iconStyle} /> },
  { id: "contact",    label: "Contact.exe", glyph: <Mail     variant="32x32_4" style={iconStyle} /> },
  { id: "recycle",    label: "Recycle Bin", glyph: <RecycleEmpty variant="32x32_4" style={iconStyle} /> },
];

/* ── Component ─────────────────────────────────────────────── */

export function Desktop() {
  // Welcome window open by default so the page has presence on first load.
  const [windows, setWindows] = useState<DesktopWindow[]>(() => [
    { ...templates.welcome, z: 1, minimized: false },
  ]);
  const [focusedId, setFocusedId] = useState<WindowId | null>("welcome");
  const [selectedIconId, setSelectedIconId] = useState<WindowId | null>(null);
  const [startOpen, setStartOpen] = useState(false);

  // Centre the welcome window on desktop after hydration.
  // Mobile windows are already CSS-centred in Win98Window; this handles desktop.
  useEffect(() => {
    if (window.innerWidth < 640) return; // mobile handled by CSS
    const w = templates.welcome.width;
    const x = Math.round(Math.max(8, (window.innerWidth - w) / 2));
    const y = Math.round(Math.max(8, (window.innerHeight - 380) / 3));
    setWindows((prev) =>
      prev.map((win) => (win.id === "welcome" ? { ...win, x, y } : win))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextZ = useCallback(() => {
    const max = windows.reduce((m, w) => Math.max(m, w.z), 0);
    return max + 1;
  }, [windows]);

  const open = useCallback(
    (id: WindowId) => {
      setStartOpen(false);
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        const topZ = prev.reduce((m, w) => Math.max(m, w.z), 0) + 1;
        if (existing) {
          return prev.map((w) =>
            w.id === id ? { ...w, z: topZ, minimized: false } : w
          );
        }
        return [
          ...prev,
          { ...templates[id], z: topZ, minimized: false },
        ];
      });
      setFocusedId(id);
    },
    []
  );

  const close = useCallback((id: WindowId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setFocusedId((f) => (f === id ? null : f));
  }, []);

  const minimize = useCallback((id: WindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
    setFocusedId((f) => (f === id ? null : f));
  }, []);

  const focus = useCallback(
    (id: WindowId) => {
      if (focusedId === id) return;
      setWindows((prev) => {
        const topZ = prev.reduce((m, w) => Math.max(m, w.z), 0) + 1;
        return prev.map((w) => (w.id === id ? { ...w, z: topZ } : w));
      });
      setFocusedId(id);
    },
    [focusedId]
  );

  const move = useCallback((id: WindowId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  const onTaskClick = useCallback(
    (id: WindowId) => {
      const w = windows.find((x) => x.id === id);
      if (!w) return;
      if (w.minimized) {
        setWindows((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, minimized: false, z: nextZ() } : x
          )
        );
        setFocusedId(id);
      } else if (focusedId === id) {
        minimize(id);
      } else {
        focus(id);
      }
    },
    [windows, focusedId, focus, minimize, nextZ]
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      onMouseDown={() => setSelectedIconId(null)}
    >
      {/* Desktop icons — 2-column grid so they never overflow vertically */}
      <div
        className="desktop-icons absolute top-2 left-2 z-[1]"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 84px)",
          gap: "8px",
          alignContent: "start",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {iconOrder.map((it) => (
          <DesktopIcon
            key={it.id}
            id={it.id}
            label={it.label}
            glyph={it.glyph}
            selected={selectedIconId === it.id}
            onSelect={setSelectedIconId}
            onOpen={open}
          />
        ))}
      </div>

      {/* Decorative watermark — bottom-right of the desktop */}
      <div
        aria-hidden
        className="absolute right-4 bottom-12 text-white/70 text-[11px] font-normal text-right pointer-events-none select-none leading-tight"
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
      >
        <div className="font-bold text-[14px]">
          {site.name.toUpperCase()} · 98
        </div>
        <div>Second Edition</div>
        <div>Build 0.1.0-alpha</div>
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Win98Window
          key={w.id}
          id={w.id}
          title={w.title}
          x={w.x}
          y={w.y}
          width={w.width}
          height={w.height}
          z={w.z}
          focused={focusedId === w.id}
          minimized={w.minimized}
          onFocus={focus}
          onClose={close}
          onMinimize={minimize}
          onMove={move}
        >
          {w.content}
        </Win98Window>
      ))}

      {/* Start menu */}
      <StartMenu
        open={startOpen}
        onClose={() => setStartOpen(false)}
        onOpenWindow={open}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        focusedId={focusedId}
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((v) => !v)}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}
