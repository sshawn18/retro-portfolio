"use client";

import { useEffect, useState } from "react";
import { EtherIntro } from "./EtherIntro";

const STORAGE_KEY = "ether-intro-seen";

/**
 * Wraps the intro with one-per-session gating. The intro renders on
 * first hydration (covering the desktop), then hides itself if this
 * session has already seen it. First-time visitors see the full run.
 */
export function IntroGate() {
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setShow(false);
      }
    } catch {
      /* sessionStorage may be blocked in some contexts; default to show */
    }
    setReady(true);
  }, []);

  // During the first paint we show the intro so the desktop doesn't flash.
  // Once we've checked storage we either keep it or hide it.
  if (!ready) {
    // SSR + first paint: render a blank black cover.
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-[9999] bg-black"
        style={{ pointerEvents: "none" }}
      />
    );
  }

  if (!show) return null;

  return (
    <EtherIntro
      onDone={() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* noop */
        }
        setShow(false);
      }}
    />
  );
}
