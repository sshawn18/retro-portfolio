"use client";

import { useEffect, useRef } from "react";
import type { WindowId } from "@/lib/desktop-types";
import { site } from "@/content/site";

type StartMenuProps = {
  open: boolean;
  onClose: () => void;
  onOpenWindow: (id: WindowId) => void;
};

type MenuItem = {
  id?: WindowId;
  label: string;
  glyph: string;
  href?: string;
  divider?: boolean;
};

const programs: MenuItem[] = [
  { id: "welcome",    label: "Welcome",      glyph: "👋" },
  { id: "portfolio",  label: "Portfolio.exe", glyph: "📋" },
  { id: "now",        label: "Now Playing",  glyph: "🎵" },
  { id: "letterboxd", label: "Film Diary",   glyph: "🎬" },
  { id: "anilist",    label: "Anime List",   glyph: "📺" },
  { id: "hevy",       label: "Gym Log",      glyph: "💪" },
  { divider: true, label: "", glyph: "" },
  { id: "contact",    label: "Contact.exe",  glyph: "✉️" },
  { id: "mycomputer", label: "My Computer",  glyph: "🖥️" },
];

export function StartMenu({ open, onClose, onOpenWindow }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Node;
      if (!ref.current.contains(target)) {
        // Let the Start button toggle itself.
        const startBtn = document.querySelector("[data-start-btn]");
        if (startBtn && startBtn.contains(target)) return;
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="start-menu absolute bottom-[36px] left-1 w-[240px] p-0.5 flex z-[1000]"
      role="menu"
    >
      <div className="start-menu-rail px-1 py-2 text-[14px]">
        {site.handle}98
      </div>
      <ul className="flex-1 flex flex-col p-1">
        {programs.map((item, i) => {
          if (item.divider) {
            return (
              <li
                key={`div-${i}`}
                aria-hidden
                className="my-1 mx-1 border-t border-[#808080] border-b border-b-white"
              />
            );
          }
          return (
            <li key={item.label}>
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2 px-2 py-1 bg-transparent border-0 text-left text-[12px] hover:bg-[#000080] hover:text-white focus:bg-[#000080] focus:text-white cursor-pointer"
                onClick={() => {
                  if (item.id) onOpenWindow(item.id);
                  onClose();
                }}
              >
                <span className="text-[18px] leading-none" aria-hidden>
                  {item.glyph}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
        <li
          aria-hidden
          className="my-1 mx-1 border-t border-[#808080] border-b border-b-white"
        />
        <li>
          <a
            className="w-full flex items-center gap-2 px-2 py-1 text-left text-[12px] hover:bg-[#000080] hover:text-white cursor-pointer no-underline"
            href={`mailto:${site.email}`}
            onClick={onClose}
          >
            <span className="text-[18px] leading-none" aria-hidden>
              📧
            </span>
            <span>E-mail {site.handle}...</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
