import { NextResponse } from "next/server";
import { saveCard } from "@/lib/store";
import { CardData } from "@/lib/types";
import { THEMES, DEFAULT_THEME } from "@/lib/themes";

const MAX_IMAGE_LENGTH = 1_500_000; // ~1.1MB decoded, generous headroom over the compressed upload target
const MAX_TEXT_LENGTH = 2000;
const MAX_SHORT_LENGTH = 200;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const image = str(body.image, MAX_IMAGE_LENGTH + 100);
  if (image.length > MAX_IMAGE_LENGTH) {
    return NextResponse.json({ error: "Photo is too large." }, { status: 413 });
  }

  const theme = THEMES.some((t) => t.id === body.theme)
    ? (body.theme as CardData["theme"])
    : DEFAULT_THEME;

  const imageAspect =
    typeof body.imageAspect === "number" && Number.isFinite(body.imageAspect)
      ? Math.min(1.8, Math.max(0.6, body.imageAspect))
      : 1;

  const data: CardData = {
    name: str(body.name, MAX_SHORT_LENGTH),
    title: str(body.title, MAX_SHORT_LENGTH),
    message: str(body.message, MAX_TEXT_LENGTH),
    date: str(body.date, 20),
    dateMode: body.dateMode === "together" ? "together" : "countdown",
    theme,
    song: str(body.song, MAX_SHORT_LENGTH * 2),
    image,
    imageAspect,
  };

  try {
    const id = await saveCard(data);
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save card." },
      { status: 500 }
    );
  }
}
