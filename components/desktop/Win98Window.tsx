"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * A Win98-styled window with a draggable title bar, focus-on-click, and
 * minimize/close controls. Responsive fallback: on narrow viewports the
 * window expands to near-fullscreen and drag is disabled.
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const flushMove = useCallback(() => {
    if (pendingPos.current) {
      onMove(id, pendingPos.current.x, pendingPos.current.y);
      pendingPos.current = null;
    }
    rafRef.current = null;
  }, [id, onMove]);

  const onTitlePointerDown = (e: React.PointerEvent) => {
    // Ignore clicks on the control buttons
    if ((e.target as HTMLElement).closest("button")) return;
    if (isMobile) return;
    onFocus(id);
    dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTitlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const nextX = Math.max(0, e.clientX - dragOffset.current.dx);
    const nextY = Math.max(0, e.clientY - dragOffset.current.dy);
    pendingPos.current = { x: nextX, y: nextY };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushMove);
    }
  };

  const onTitlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  if (minimized) return null;

  // Mobile: hug content height (no forced bottom stretch), cap before taskbar
  const positionStyle = isMobile
    ? {
        top: 8,
        left: 8,
        right: 8,
        width: "auto",
        maxHeight: "calc(100vh - 52px)", // taskbar(36) + top margin(8) + gap(8)
        zIndex: z,
        overflow: "hidden",
      }
    : {
        top: y,
        left: x,
        width,
        height,
        zIndex: z,
      };

  return (
    <div
      className="window absolute"
      style={positionStyle}
      onMouseDown={() => onFocus(id)}
      role="dialog"
      aria-label={title}
    >
      <div
        className={`title-bar ${focused ? "" : "inactive"}`}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onPointerCancel={onTitlePointerUp}
        style={{ cursor: isMobile ? "default" : "grab", touchAction: "none" }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="title-bar-text truncate">{title}</div>
        <div className="title-bar-controls">
          <button
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
          />
          <button
            aria-label="Maximize"
            onClick={(e) => e.stopPropagation()}
            disabled
          />
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          />
        </div>
      </div>
      <div
        className="window-body overflow-auto"
        style={{ maxHeight: isMobile ? "calc(100vh - 90px)" : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
