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
  const [isMobile, setIsMobile] = useState(false);
  // Once the user drags on mobile, switch from CSS-centre to x/y coords
  const [hasDragged, setHasDragged] = useState(false);

  const dragging = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
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
    if ((e.target as HTMLElement).closest("button")) return;
    onFocus(id);

    // On mobile before first drag, read actual rendered position from DOM
    // so the window doesn't jump when we switch from CSS centering to x/y
    if (isMobile && !hasDragged && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      onMove(id, rect.left, rect.top);
      dragOffset.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      setHasDragged(true);
    } else {
      dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
    }

    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTitlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const nextX = Math.max(0, Math.min(e.clientX - dragOffset.current.dx, window.innerWidth - 80));
    const nextY = Math.max(0, Math.min(e.clientY - dragOffset.current.dy, window.innerHeight - 60));
    pendingPos.current = { x: nextX, y: nextY };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushMove);
    }
  };

  const onTitlePointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { /* noop */ }
  };

  if (minimized) return null;

  // Mobile (before drag): CSS-centre the window so it always opens centred
  // regardless of SSR/hydration timing.
  // After first drag (or on desktop): use explicit x/y from state.
  const useCSSCentre = isMobile && !hasDragged;

  const positionStyle: React.CSSProperties = useCSSCentre
    ? {
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: `min(${width}px, calc(100vw - 16px))`,
        maxHeight: "calc(100vh - 52px)",
        zIndex: z,
        display: "flex",
        flexDirection: "column",
      }
    : {
        top: y,
        left: x,
        width: `min(${width}px, calc(100vw - 16px))`,
        height,
        maxHeight: "calc(100vh - 52px)",
        zIndex: z,
        display: "flex",
        flexDirection: "column",
      };

  return (
    <div
      ref={containerRef}
      className="window absolute"
      style={positionStyle}
      onMouseDown={() => onFocus(id)}
      onTouchStart={() => onFocus(id)}
      role="dialog"
      aria-label={title}
    >
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
          <button aria-label="Minimize" onClick={(e) => { e.stopPropagation(); onMinimize(id); }} />
          <button aria-label="Maximize" onClick={(e) => e.stopPropagation()} disabled />
          <button aria-label="Close" onClick={(e) => { e.stopPropagation(); onClose(id); }} />
        </div>
      </div>
      <div className="window-body overflow-auto" style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
