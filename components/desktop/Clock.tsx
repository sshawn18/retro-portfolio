"use client";

import { useEffect, useState } from "react";

function fmt(d: Date) {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${meridiem}`;
}

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="tray-well flex items-center gap-1 font-normal text-[11px] leading-none min-w-[72px] justify-center"
      aria-label="Clock"
      suppressHydrationWarning
    >
      <span aria-hidden>🔊</span>
      <span>{now ? fmt(now) : "—:— —"}</span>
    </div>
  );
}
