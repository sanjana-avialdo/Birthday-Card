"use client";

import { useEffect, useState } from "react";
import type { DateMode } from "./types";

export interface CountdownResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  reached: boolean; // countdown: date has arrived / together: start date reached
  valid: boolean;
}

function diffParts(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays - years * 365 - months * 30;
  return { years, months, days, hours, minutes, seconds, totalDays };
}

export function useCountdown(dateStr: string, mode: DateMode): CountdownResult {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = dateStr ? new Date(`${dateStr}T00:00:00`).getTime() : NaN;
  const valid = Number.isFinite(target);

  if (!valid || now === null) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      reached: false,
      valid: false,
    };
  }

  const diff = mode === "countdown" ? target - now : now - target;
  const reached = diff <= 0;
  const parts = diffParts(diff);

  return { ...parts, reached, valid: true };
}
