export type ThemeId =
  | "theme-midnight"
  | "theme-sunset"
  | "theme-pastel"
  | "theme-galaxy"
  | "theme-gold";

export type DateMode = "countdown" | "together";

export interface CardData {
  name: string;
  title: string;
  message: string;
  date: string; // ISO yyyy-mm-dd
  dateMode: DateMode;
  theme: ThemeId;
  song: string;
  image: string; // data URI or remote URL
  imageAspect: number; // width / height, clamped to [0.6, 1.8]
}

export const DEFAULT_CARD_DATA: CardData = {
  name: "",
  title: "Happy Birthday",
  message: "",
  date: "",
  dateMode: "countdown",
  theme: "theme-midnight",
  song: "",
  image: "",
  imageAspect: 1,
};
