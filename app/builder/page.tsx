"use client";

import { useState, useSyncExternalStore } from "react";
import { Copy, Check, ExternalLink, ImageUp, X, Sparkles, Loader2 } from "lucide-react";
import { CardData, DEFAULT_CARD_DATA, DateMode } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { fileToResizedDataUrl } from "@/lib/image";
import { BirthdayCard } from "@/components/BirthdayCard";

const SONG_PRESETS = [
  { label: "Uplifting", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { label: "Warm & Mellow", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { label: "Dreamy", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
];

const MESSAGE_TEMPLATES = [
  "Happy Birthday to the most beautiful person in my life. ❤️",
  "Wishing you a day as amazing as you are — I love you endlessly.",
  "Another year of your incredible life. I'm so lucky to share it with you.",
];

function fieldLabel(text: string) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-zinc-700">{text}</label>
  );
}

// origin never changes for the lifetime of the tab, so a no-op subscription is fine
const noopSubscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export default function BuilderPage() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA);
  const origin = useSyncExternalStore(noopSubscribe, getOrigin, getServerOrigin);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState("");
  const [shortId, setShortId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const shareUrl = shortId ? `${origin}/c/${shortId}` : "";

  const set = <K extends keyof CardData>(key: K, value: CardData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    // any edit invalidates the previously generated link
    setShortId(null);
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      set("image", dataUrl);
      setImgError("");
    } catch {
      setImgError("Couldn't read that image — try a different file.");
    }
  };

  const createLink = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create link.");
      setShortId(body.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create link.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — user can still select the text field manually
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-50 to-zinc-100">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-5">
          <Sparkles className="text-pink-500" size={22} />
          <h1 className="text-lg font-semibold text-zinc-900">
            Birthday Card Maker
          </h1>
          <span className="text-sm text-zinc-500">
            — build a surprise, share a link
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Who&apos;s it for
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel("Their name")}
                <input
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Parkash"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                {fieldLabel("Headline")}
                <input
                  value={data.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Happy Birthday My Love"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Your message
            </h2>
            <textarea
              value={data.message}
              onChange={(e) => set("message", e.target.value)}
              rows={4}
              placeholder="Write something from the heart..."
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MESSAGE_TEMPLATES.map((t) => (
                <button
                  key={t}
                  onClick={() => set("message", t)}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-pink-300 hover:text-pink-600"
                >
                  {t.slice(0, 28)}…
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Special date
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {fieldLabel("Date")}
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div>
                {fieldLabel("Counter type")}
                <div className="flex gap-2">
                  {(
                    [
                      { id: "countdown", label: "⏳ Countdown to it" },
                      { id: "together", label: "💞 Time together" },
                    ] as { id: DateMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => set("dateMode", opt.id)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        data.dateMode === opt.id
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Theme
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set("theme", t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition ${
                    data.theme === t.id ? "ring-2 ring-pink-400" : "ring-1 ring-zinc-200"
                  }`}
                >
                  <span
                    className="h-10 w-full rounded-lg"
                    style={{ background: t.swatch }}
                  />
                  <span className="text-[11px] font-medium text-zinc-600">
                    {t.emoji} {t.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Photo
            </h2>
            {data.image ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.image}
                  alt="Selected"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  onClick={() => set("image", "")}
                  className="flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:border-red-300 hover:text-red-600"
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-6 text-sm text-zinc-500 hover:border-pink-300 hover:text-pink-600">
                <ImageUp size={18} />
                Upload a photo
                <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              </label>
            )}
            {imgError && <p className="mt-2 text-xs text-red-600">{imgError}</p>}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Music
            </h2>
            {fieldLabel("Song URL (direct .mp3 link)")}
            <input
              value={data.song}
              onChange={(e) => set("song", e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SONG_PRESETS.map((s) => (
                <button
                  key={s.url}
                  onClick={() => set("song", s.url)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    data.song === s.url
                      ? "border-pink-400 bg-pink-50 text-pink-700"
                      : "border-zinc-200 text-zinc-600 hover:border-pink-300"
                  }`}
                >
                  {s.label} sample
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Preview + share */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[2.5rem] border-8 border-zinc-900 bg-zinc-900 shadow-xl">
            <div className="h-[640px] w-full overflow-hidden">
              <BirthdayCard data={data} previewMode />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-zinc-700">
              Shareable link
            </h3>
            {shortId ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.target.select()}
                    className="w-full truncate rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-600"
                  />
                  <button
                    onClick={copyLink}
                    aria-label="Copy link"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-700"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open card"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:border-zinc-400"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p className="text-xs text-zinc-400">
                  Want this to be your site&apos;s homepage instead of this
                  form? Set <code className="rounded bg-zinc-100 px-1 py-0.5">CARD_ID={shortId}</code>{" "}
                  in your Vercel project&apos;s environment variables.
                </p>
              </div>
            ) : (
              <button
                onClick={createLink}
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating link...
                  </>
                ) : (
                  "Create shareable link"
                )}
              </button>
            )}
            {createError && (
              <p className="mt-2 text-xs text-red-600">{createError}</p>
            )}
            {!shortId && !createError && (
              <p className="mt-2 text-xs text-zinc-400">
                Editing the form will require creating a new link.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
