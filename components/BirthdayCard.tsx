"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Share2, Check } from "lucide-react";
import type { CardData } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { Particles } from "./Particles";
import { CountdownTimer } from "./CountdownTimer";
import { MusicPlayer, MusicPlayerHandle } from "./MusicPlayer";

function fireConfetti(color: string) {
  const colors = [color, "#ffffff"];
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    scalar: 0.9,
  });
  setTimeout(
    () =>
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { y: 0.4 },
        colors,
        scalar: 0.7,
      }),
    250
  );
}

export function BirthdayCard({
  data,
  previewMode = false,
}: {
  data: CardData;
  previewMode?: boolean;
}) {
  const theme = getTheme(data.theme);
  const [revealed, setRevealed] = useState(previewMode);
  const [copied, setCopied] = useState(false);
  const musicRef = useRef<MusicPlayerHandle>(null);

  const handleReveal = () => {
    setRevealed(true);
    fireConfetti(theme.accent);
    musicRef.current?.play();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div
      className="relative flex min-h-full w-full flex-1 items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: theme.background }}
    >
      <Particles kind={theme.particle} color={theme.particleColor} />

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="gate"
            onClick={handleReveal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-4 rounded-3xl px-10 py-12 text-center"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="text-5xl"
            >
              {theme.emoji}
            </motion.span>
            <p
              className="text-lg font-medium sm:text-xl"
              style={{ color: theme.text, fontFamily: "var(--font-display)" }}
            >
              A surprise for {data.name || "you"}
            </p>
            <span
              className="rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider"
              style={{ background: theme.accent, color: "#1a1208" }}
            >
              Tap to open 💌
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 rounded-4xl px-6 py-10 text-center sm:px-10"
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(14px)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            }}
          >
            {data.image && (
              <motion.div
                initial={{ scale: 0.8, rotate: -6, opacity: 0 }}
                animate={{ scale: 1, rotate: -3, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="overflow-hidden rounded-2xl p-1.5"
                style={{
                  background: theme.accent,
                  aspectRatio: String(data.imageAspect ?? 1),
                  ...((data.imageAspect ?? 1) >= 1
                    ? { width: "clamp(9rem, 30vw, 11rem)", height: "auto" }
                    : { height: "clamp(9rem, 30vw, 11rem)", width: "auto" }),
                }}
              >
                {/* data URLs / arbitrary remote photos — next/image can't optimize these reliably */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.image}
                  alt={data.name || "Birthday photo"}
                  className="h-full w-full rounded-xl object-cover"
                />
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold sm:text-4xl"
                style={{ color: theme.accent, fontFamily: "var(--font-display)" }}
              >
                {data.title || "Happy Birthday"}
              </motion.h1>
              {data.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl sm:text-2xl"
                  style={{ color: theme.text, fontFamily: "var(--font-script)" }}
                >
                  {data.name}
                </motion.p>
              )}
            </div>

            {data.message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="whitespace-pre-line text-sm leading-relaxed sm:text-base"
                style={{ color: theme.subtext }}
              >
                {data.message}
              </motion.p>
            )}

            {data.date && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <CountdownTimer date={data.date} mode={data.dateMode} theme={theme} />
              </motion.div>
            )}

            <div className="mt-2 flex items-center gap-3">
              <MusicPlayer ref={musicRef} song={data.song} theme={theme} />
              {!previewMode && (
                <button
                  onClick={handleShare}
                  aria-label="Copy link"
                  className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition hover:scale-105"
                  style={{
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.accent,
                  }}
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
