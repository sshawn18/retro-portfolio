"use client";

import { useCallback, useRef, useState } from "react";
import type { WindowId } from "@/lib/desktop-types";

type Win98WindowProps = {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  z: number;
  focused: boolean;
  minimized: boolean;
  onFocus: (id: WindowId) => void;
  onClose: (id: WindowId) => void;
  onMinimize: (id: WindowId) => void;
  onMove: (id: WindowId, x: number, y: number) => void;
  children: React.ReactNode;
};

/**
 * Win98 window — draggable on ALL screen sizes via Pointer Events API
 * (works for both mouse and touch). Width is capped to viewport so it never
 * overflows off-screen on mobile.
 */
export function Win98Window({
  id,
  title,
  x,
  y,
  width,
  height,
  z,
  focused,
  minimized,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  children,
}: Win98WindowProps) {
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);

  const flushMove = useCallback(() => {
    if (pendingPos.current) {
      onMove(id, pendingPos.current.x, pendingPos.current.y);
      pendingPos.current = null;
    }
    rafRef.current = null;
  }, [id, onMove]);

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onFocus(id);
    dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTitlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    // Clamp so window title bar stays on-screen
    const nextX = Math.max(0, Math.min(e.clientX - dragOffset.current.dx, window.innerWidth - 80));
    const nextY = Math.max(0, Math.min(e.clientY - dragOffset.current.dy, window.innerHeight - 60));
    pendingPos.current = { x: nextX, y: nextY };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushMove);
    }
  };

  const onTitlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { /* noop */ }
  };

  if (minimized) return null;

  return (
    <div
      className="window absolute"
      style={{
        top: y,
        left: x,
        // Cap width on narrow screens — CSS min() keeps it fluid
        width: `min(${width}px, calc(100vw - 16px))`,
        height,
        zIndex: z,
        // Never let window overflow below the taskbar
        maxHeight: "calc(100vh - 52px)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={() => onFocus(id)}
      onTouchStart={() => onFocus(id)}
      role="dialog"
      aria-label={title}
    >
      {/* Title bar — drag handle on all screen sizes */}
      <div
        className={`title-bar ${focused ? "" : "inactive"}`}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onPointerCancel={onTitlePointerUp}
        style={{ cursor: "grab", touchAction: "none", flexShrink: 0 }}
      >
        <div className="title-bar-text truncate">{title}</div>
        <div className="title-bar-controls">
          <button
            aria-label="Minimize"
            onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
          />
          <button
            aria-label="Maximize"
            onClick={(e) => e.stopPropagation()}
            disabled
          />
          <button
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); onClose(id); }}
          />
        </div>
      </div>

      {/* Body — scrolls when content is taller than the window */}
      <div
        className="window-body overflow-auto"
        style={{ flex: 1, minHeight: 0 }}
      >
        {children}
      </div>
    </div>
  );
}
