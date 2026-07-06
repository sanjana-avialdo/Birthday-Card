"use client";

import { useCountdown } from "@/lib/useCountdown";
import type { DateMode } from "@/lib/types";
import type { Theme } from "@/lib/themes";

function Unit({
  value,
  label,
  theme,
}: {
  value: number;
  label: string;
  theme: Theme;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold tabular-nums sm:h-16 sm:w-16 sm:text-2xl"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          color: theme.accent,
          backdropFilter: "blur(6px)",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span
        className="text-[10px] uppercase tracking-widest sm:text-xs"
        style={{ color: theme.subtext }}
      >
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  date,
  mode,
  theme,
}: {
  date: string;
  mode: DateMode;
  theme: Theme;
}) {
  const c = useCountdown(date, mode);

  if (!date) return null;

  if (!c.valid) return null;

  if (c.reached && mode === "countdown") {
    return (
      <p
        className="text-center text-lg font-semibold sm:text-xl"
        style={{ color: theme.accent, fontFamily: "var(--font-display)" }}
      >
        🎉 Today is the day! 🎉
      </p>
    );
  }

  const heading =
    mode === "countdown" ? "Counting down to your day" : "Together for";

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-xs uppercase tracking-[0.2em] sm:text-sm"
        style={{ color: theme.subtext }}
      >
        {heading}
      </p>
      <div className="flex gap-2 sm:gap-3">
        {c.years > 0 && <Unit value={c.years} label="yrs" theme={theme} />}
        {(c.years > 0 || c.months > 0) && (
          <Unit value={c.months} label="mo" theme={theme} />
        )}
        <Unit value={c.days} label="days" theme={theme} />
        <Unit value={c.hours} label="hrs" theme={theme} />
        <Unit value={c.minutes} label="min" theme={theme} />
        <Unit value={c.seconds} label="sec" theme={theme} />
      </div>
    </div>
  );
}
