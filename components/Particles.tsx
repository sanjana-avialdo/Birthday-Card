"use client";

import { useSyncExternalStore } from "react";
import type { ParticleKind } from "@/lib/themes";

const GLYPH: Record<ParticleKind, string[]> = {
  hearts: ["♥", "❤", "💗"],
  stars: ["✦", "✧", "・"],
  petals: ["❀", "✿", "❁"],
  confetti: ["✦", "❖", "✳"],
  bubbles: ["○", "●"],
};

interface ParticleSpec {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  glyph: string;
  twinkle: boolean;
}

const EMPTY_PARTICLES: ParticleSpec[] = [];
const particleCache = new Map<string, ParticleSpec[]>();

function generateParticles(kind: ParticleKind, count: number): ParticleSpec[] {
  const glyphs = GLYPH[kind];
  const twinkle = kind === "stars";
  return Array.from({ length: count }, (_, i) => ({
    left: Math.round((i / count) * 100 + (Math.random() * 8 - 4)),
    top: (i * 37) % 100,
    size: kind === "stars" ? 4 + Math.random() * 6 : 12 + Math.random() * 16,
    delay: Math.random() * 10,
    duration: twinkle ? 2 + Math.random() * 3 : 10 + Math.random() * 12,
    drift: Math.random() * 120 - 60,
    glyph: glyphs[i % glyphs.length],
    twinkle,
  }));
}

// Particle layout is randomized once per (kind, count) and cached so the
// snapshot reference is stable — generated lazily on the client only, since
// random values would mismatch between server and client render.
function getParticles(kind: ParticleKind, count: number): ParticleSpec[] {
  const key = `${kind}:${count}`;
  let cached = particleCache.get(key);
  if (!cached) {
    cached = generateParticles(kind, count);
    particleCache.set(key, cached);
  }
  return cached;
}

const noopSubscribe = () => () => {};

export function Particles({
  kind,
  color,
  count = 22,
}: {
  kind: ParticleKind;
  color: string;
  count?: number;
}) {
  const particles = useSyncExternalStore(
    noopSubscribe,
    () => getParticles(kind, count),
    () => EMPTY_PARTICLES
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: p.twinkle ? undefined : "-5%",
            top: p.twinkle ? `${p.top}%` : undefined,
            fontSize: p.size,
            color,
            opacity: 0.8,
            ["--drift" as string]: `${p.drift}px`,
            animation: p.twinkle
              ? `twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`
              : `float-up ${p.duration}s linear ${p.delay}s infinite`,
            filter: "drop-shadow(0 0 6px rgba(0,0,0,0.15))",
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
