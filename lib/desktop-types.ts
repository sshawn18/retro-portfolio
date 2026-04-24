import type { ReactNode } from "react";

export type WindowId =
  | "welcome"
  | "about"
  | "mycomputer"
  | "projects"
  | "now"
  | "letterboxd"
  | "anilist"
  | "blog"
  | "contact"
  | "recycle";

export type DesktopWindow = {
  id: WindowId;
  title: string;
  icon: string; // emoji or icon character
  /** Initial top-left position. */
  x: number;
  y: number;
  /** Initial size — windows are resizable via drag-corner later; for now fixed. */
  width: number;
  height?: number;
  /** Focused z-index order. Higher = on top. */
  z: number;
  minimized: boolean;
  content: ReactNode;
};
