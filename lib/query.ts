import { CardData, DEFAULT_CARD_DATA, DateMode } from "./types";
import { DEFAULT_THEME, THEMES } from "./themes";

type SearchParamsInput = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTheme(value: string | undefined): CardData["theme"] {
  const found = THEMES.find((t) => t.id === value);
  return found ? found.id : DEFAULT_THEME;
}

function normalizeDateMode(value: string | undefined): DateMode {
  return value === "together" ? "together" : "countdown";
}

function normalizeImageAspect(value: string | undefined): number {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? Math.min(1.8, Math.max(0.6, parsed)) : DEFAULT_CARD_DATA.imageAspect;
}

export function decodeCardData(sp: SearchParamsInput): CardData {
  return {
    name: first(sp.n) || DEFAULT_CARD_DATA.name,
    title: first(sp.t) || DEFAULT_CARD_DATA.title,
    message: first(sp.m) || DEFAULT_CARD_DATA.message,
    date: first(sp.d) || DEFAULT_CARD_DATA.date,
    dateMode: normalizeDateMode(first(sp.dt)),
    theme: normalizeTheme(first(sp.th)),
    song: first(sp.s) || DEFAULT_CARD_DATA.song,
    image: first(sp.img) || DEFAULT_CARD_DATA.image,
    imageAspect: normalizeImageAspect(first(sp.ia)),
  };
}
