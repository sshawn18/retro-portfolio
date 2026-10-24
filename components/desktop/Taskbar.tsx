"use client";

import type { DesktopWindow, WindowId } from "@/lib/desktop-types";
import { site } from "@/content/site";
import { Clock } from "./Clock";

type TaskbarProps = {
  windows: DesktopWindow[];
  focusedId: WindowId | null;
  onToggleStart: () => void;
  startOpen: boolean;
  onTaskClick: (id: WindowId) => void;
};

/* ── Brand SVG icons ─────────────────────────────────────────── */

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LetterboxdIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.224 14.352a4.447 4.447 0 0 1-3.775 2.092C1.992 16.444 0 14.454 0 12s1.992-4.444 4.45-4.444c1.592 0 2.988.836 3.774 2.092-.427.682-.673 1.488-.673 2.352s.246 1.67.673 2.352zM15.101 12c0-.864.247-1.67.674-2.352-.786-1.256-2.183-2.092-3.775-2.092s-2.989.836-3.775 2.092c.427.682.674 1.488.674 2.352s-.247 1.67-.674 2.352c.786 1.256 2.183 2.092 3.775 2.092s2.989-.836 3.775-2.092A4.42 4.42 0 0 1 15.1 12zm4.45-4.444a4.447 4.447 0 0 0-3.775 2.092c.427.682.673 1.488.673 2.352s-.246 1.67-.673 2.352a4.447 4.447 0 0 0 3.775 2.092C22.008 16.444 24 14.454 24 12s-1.992-4.444-4.45-4.444z" />
    </svg>
  );
}

function LastFmIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" />
    </svg>
  );
}

function TaskbarLink({
  href,
  title,
  label,
  icon,
}: {
  href: string;
  title: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="flex items-center gap-1.5 h-7 px-2 text-[11px] hover:bg-[#000080] hover:text-white transition-none"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

/* ── Separator ───────────────────────────────────────────────── */
function Sep() {
  return (
    <div
      aria-hidden
      className="h-6 w-[2px] mx-0.5"
      style={{ background: "linear-gradient(to right, #808080 50%, #fff 50%)" }}
    />
  );
}

/* ── Component ───────────────────────────────────────────────── */

export function Taskbar({
  windows,
  focusedId,
  onToggleStart,
  startOpen,
  onTaskClick,
}: TaskbarProps) {
  return (
    <div
      className="taskbar absolute bottom-0 left-0 right-0 h-9 flex items-center gap-1 px-1 z-[100]"
      role="toolbar"
      aria-label="Taskbar"
    >
      {/* Start button */}
      <button
        data-start-btn
        type="button"
        onClick={onToggleStart}
        className="flex items-center gap-1.5 h-7 px-2 text-[12px] font-bold"
        style={startOpen ? { borderStyle: "inset", background: "#bdbdbd" } : undefined}
        aria-pressed={startOpen}
        aria-haspopup="menu"
      >
        <span aria-hidden className="text-[14px] leading-none">🪟</span>
        <span>Start</span>
      </button>

      <Sep />

      {/* Open windows — icon only on mobile, icon+label on desktop */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className="taskbar-btn flex items-center justify-center gap-1 h-7 text-[12px] min-w-0"
            style={{ padding: "0 6px" }}
            data-active={focusedId === w.id && !w.minimized ? "true" : undefined}
            onClick={() => onTaskClick(w.id)}
            title={w.title}
          >
            <span aria-hidden className="text-[16px] leading-none flex-shrink-0">{w.icon}</span>
            {/* Label hidden on small screens */}
            <span className="truncate hidden sm:inline max-w-[120px]">{w.title}</span>
          </button>
        ))}
      </div>

      {/* ── My links — desktop only ─────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1">
        <Sep />

        <TaskbarLink
          href="https://github.com/sshawn18"
          title="GitHub — @sshawn18"
          label="GitHub"
          icon={<GitHubIcon />}
        />
        <TaskbarLink
          href={site.linkedin}
          title="LinkedIn — Ravi Gupta"
          label="LinkedIn"
          icon={<LinkedInIcon />}
        />
        <TaskbarLink
          href={`https://letterboxd.com/${site.letterboxdUsername}/`}
          title={`Letterboxd — @${site.letterboxdUsername}`}
          label="Letterboxd"
          icon={<LetterboxdIcon />}
        />
        <TaskbarLink
          href={`https://www.last.fm/user/${site.lastfmUsername}`}
          title={`Last.fm — @${site.lastfmUsername}`}
          label="Last.fm"
          icon={<LastFmIcon />}
        />

        <Sep />
      </div>

      <Clock />
    </div>
  );
}
