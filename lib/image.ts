"use client";

// The photo is stored server-side (not embedded in the URL), so it just needs
// to stay well under the API's storage cap (see MAX_IMAGE_LENGTH in
// app/api/cards/route.ts) — we shrink only if the first pass comes in large.
const TARGET_DATA_URL_LENGTH = 700_000;
const ATTEMPTS: Array<{ maxDim: number; quality: number }> = [
  { maxDim: 1080, quality: 0.82 },
  { maxDim: 900, quality: 0.75 },
  { maxDim: 720, quality: 0.7 },
  { maxDim: 560, quality: 0.65 },
  { maxDim: 400, quality: 0.6 },
];

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => resolve(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function drawToDataUrl(img: HTMLImageElement, maxDim: number, quality: number): string {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const img = await loadImageElement(file);

  let best = drawToDataUrl(img, ATTEMPTS[0].maxDim, ATTEMPTS[0].quality);
  for (const { maxDim, quality } of ATTEMPTS) {
    const dataUrl = drawToDataUrl(img, maxDim, quality);
    best = dataUrl;
    if (dataUrl.length <= TARGET_DATA_URL_LENGTH) break;
  }
  return best;
}
