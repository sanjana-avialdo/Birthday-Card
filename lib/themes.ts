import type { ThemeId } from "./types";

export type ParticleKind = "hearts" | "stars" | "petals" | "confetti" | "bubbles";

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  background: string; // CSS gradient
  overlay?: string; // optional extra CSS layer (e.g. radial vignette)
  cardBg: string; // glass panel background
  cardBorder: string;
  accent: string; // headline / accent color
  text: string; // primary text color
  subtext: string; // secondary text color
  particle: ParticleKind;
  particleColor: string;
  swatch: string; // small gradient used in theme picker UI
}

export const THEMES: Theme[] = [
  {
    id: "theme-midnight",
    label: "Midnight",
    emoji: "🌙",
    background:
      "radial-gradient(120% 120% at 50% 0%, #1b1f4b 0%, #0d0e2b 45%, #05050f 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.14)",
    accent: "#f5c451",
    text: "#f6f3ff",
    subtext: "#c7c9e8",
    particle: "stars",
    particleColor: "#f5f0ff",
    swatch: "linear-gradient(135deg,#1b1f4b,#05050f)",
  },
  {
    id: "theme-sunset",
    label: "Sunset",
    emoji: "🌇",
    background:
      "linear-gradient(160deg, #ff7e5f 0%, #feb47b 35%, #6a3093 100%)",
    cardBg: "rgba(255,255,255,0.14)",
    cardBorder: "rgba(255,255,255,0.28)",
    accent: "#fff2c6",
    text: "#fffaf0",
    subtext: "#ffe3d1",
    particle: "hearts",
    particleColor: "#ffd8c2",
    swatch: "linear-gradient(135deg,#ff7e5f,#6a3093)",
  },
  {
    id: "theme-pastel",
    label: "Pastel Dream",
    emoji: "🌸",
    background:
      "linear-gradient(160deg, #ffd1ff 0%, #c9f0ff 55%, #d1ffd6 100%)",
    cardBg: "rgba(255,255,255,0.55)",
    cardBorder: "rgba(255,255,255,0.8)",
    accent: "#e0559b",
    text: "#4a3350",
    subtext: "#6f5a76",
    particle: "petals",
    particleColor: "#ff9ecb",
    swatch: "linear-gradient(135deg,#ffd1ff,#d1ffd6)",
  },
  {
    id: "theme-galaxy",
    label: "Galaxy",
    emoji: "✨",
    background:
      "radial-gradient(130% 130% at 20% 10%, #3a0ca3 0%, #240046 40%, #10002b 100%)",
    cardBg: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(190,150,255,0.35)",
    accent: "#7cf5d0",
    text: "#f2e9ff",
    subtext: "#c9b6ff",
    particle: "stars",
    particleColor: "#b794f6",
    swatch: "linear-gradient(135deg,#3a0ca3,#10002b)",
  },
  {
    id: "theme-gold",
    label: "Golden Luxe",
    emoji: "🥂",
    background:
      "radial-gradient(120% 120% at 50% 0%, #2b2b2b 0%, #141414 55%, #000000 100%)",
    cardBg: "rgba(255,215,120,0.08)",
    cardBorder: "rgba(255,215,120,0.35)",
    accent: "#f4cf6d",
    text: "#fdf6e3",
    subtext: "#d8c690",
    particle: "confetti",
    particleColor: "#f4cf6d",
    swatch: "linear-gradient(135deg,#f4cf6d,#141414)",
  },
];

export const DEFAULT_THEME: ThemeId = "theme-midnight";

export function getTheme(id: string | undefined | null): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
}
