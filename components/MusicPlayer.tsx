"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";
import type { Theme } from "@/lib/themes";

export interface MusicPlayerHandle {
  play: () => void;
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, { song: string; theme: Theme }>(
  function MusicPlayer({ song, theme }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      play: () => {
        audioRef.current
          ?.play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      },
    }));

    if (!song) return null;

    const toggle = () => {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) {
        el.play().then(() => setPlaying(true)).catch(() => {});
      } else {
        el.pause();
        setPlaying(false);
      }
    };

    return (
      <>
        <audio ref={audioRef} src={song} loop preload="auto" />
        <button
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition hover:scale-105"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            color: theme.accent,
          }}
        >
          {playing ? <Pause size={18} /> : <Music size={18} />}
        </button>
      </>
    );
  }
);
