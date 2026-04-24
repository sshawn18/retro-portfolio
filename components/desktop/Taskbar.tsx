"use client";

import type { DesktopWindow, WindowId } from "@/lib/desktop-types";
import { Clock } from "./Clock";

type TaskbarProps = {
  windows: DesktopWindow[];
  focusedId: WindowId | null;
  onToggleStart: () => void;
  startOpen: boolean;
  onTaskClick: (id: WindowId) => void;
};

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
      <button
        data-start-btn
        type="button"
        onClick={onToggleStart}
        className="flex items-center gap-1.5 h-7 px-2 text-[12px] font-bold"
        style={
          startOpen
            ? { borderStyle: "inset", background: "#bdbdbd" }
            : undefined
        }
        aria-pressed={startOpen}
        aria-haspopup="menu"
      >
        <span aria-hidden className="text-[14px] leading-none">🪟</span>
        <span>Start</span>
      </button>

      <div
        aria-hidden
        className="h-6 w-[2px] mx-0.5"
        style={{
          background: "linear-gradient(to right, #808080 50%, #fff 50%)",
        }}
      />

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className="taskbar-btn flex items-center gap-1.5 h-7 px-2 text-[12px] min-w-0 max-w-[180px]"
            data-active={
              focusedId === w.id && !w.minimized ? "true" : undefined
            }
            onClick={() => onTaskClick(w.id)}
            title={w.title}
          >
            <span aria-hidden className="text-[14px] leading-none">
              {w.icon}
            </span>
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      <Clock />
    </div>
  );
}
