"use client";

import { useState, type ReactNode } from "react";
import type { WindowId } from "@/lib/desktop-types";

type DesktopIconProps = {
  id: WindowId;
  label: string;
  glyph: ReactNode;
  onOpen: (id: WindowId) => void;
  selected: boolean;
  onSelect: (id: WindowId | null) => void;
};

/**
 * Desktop icon — single tap on touch, double-click on mouse.
 */
export function DesktopIcon({
  id,
  label,
  glyph,
  onOpen,
  selected,
  onSelect,
}: DesktopIconProps) {
  const [lastClick, setLastClick] = useState(0);
  // Track whether the last open came from touch so we can suppress
  // the ghost click that browsers fire after touchend.
  const touchOpenedRef = { current: false };

  // ── Touch: open on single tap ────────────────────────────────
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // suppress the synthetic mouse click that follows
    e.stopPropagation();
    onSelect(id);
    onOpen(id);
  };

  // ── Mouse: double-click to open, single click to select ──────
  const handleClick = (e: React.MouseEvent) => {
    if (touchOpenedRef.current) {
      touchOpenedRef.current = false;
      return;
    }
    e.stopPropagation();
    onSelect(id);
    const now = Date.now();
    if (now - lastClick < 400) {
      onOpen(id);
      setLastClick(0);
    } else {
      setLastClick(now);
    }
  };

  return (
    <button
      type="button"
      className="desktop-icon"
      data-selected={selected || undefined}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(id);
        }
      }}
      aria-label={`Open ${label}`}
    >
      <div className="desktop-icon-img" aria-hidden>
        {glyph}
      </div>
      <div className="desktop-icon-label">{label}</div>
    </button>
  );
}
