"use client";

import { useState, type ReactNode } from "react";
import type { WindowId } from "@/lib/desktop-types";

type DesktopIconProps = {
  id: WindowId;
  label: string;
  /** Pre-rendered icon element — typically a <SomeIcon variant="32x32_4" /> from @react95/icons */
  glyph: ReactNode;
  onOpen: (id: WindowId) => void;
  selected: boolean;
  onSelect: (id: WindowId | null) => void;
};

/**
 * Selectable + double-clickable desktop icon.
 * Single click (or Enter when focused) selects; double-click (or Space) opens.
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
    const now = Date.now();
    if (now - lastClick < 350) {
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
