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

      {/* Open windows */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className="taskbar-btn flex items-center gap-1.5 h-7 px-2 text-[12px] min-w-0 max-w-[180px]"
            data-active={focusedId === w.id && !w.minimized ? "true" : undefined}
            onClick={() => onTaskClick(w.id)}
            title={w.title}
          >
            <span aria-hidden className="text-[14px] leading-none">{w.icon}</span>
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      {/* ── My links — desktop only ─────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1">
        <Sep />

        <a
          href="https://github.com/sshawn18"
          target="_blank"
          rel="noreferrer"
          title="GitHub — @sshawn18"
          className="flex items-center gap-1.5 h-7 px-2 text-[11px] hover:bg-[#000080] hover:text-white transition-none"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>

        <a
          href={site.linkedin}
          target="_blank"
          rel="noreferrer"
          title="LinkedIn — Ravi Gupta"
          className="flex items-center gap-1.5 h-7 px-2 text-[11px] hover:bg-[#000080] hover:text-white transition-none"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <LinkedInIcon />
          <span>LinkedIn</span>
        </a>

        <Sep />
      </div>

      <Clock />
    </div>
  );
}
