import { Redis } from "@upstash/redis";
import type { CardData } from "./types";

const CARD_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
const ID_LENGTH = 8;
const MAX_CREATE_ATTEMPTS = 5;

let client: Redis | null = null;

function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN " +
        "(see .env.local.example) — get a free database at https://upstash.com."
    );
  }

  // We only ever issue one command per request, so auto-pipelining (batching
  // concurrent commands into /pipeline) has no upside here and just adds risk.
  client = new Redis({ url, token, enableAutoPipelining: false });
  return client;
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, ID_LENGTH);
}

function keyFor(id: string): string {
  return `card:${id}`;
}

export async function saveCard(data: CardData): Promise<string> {
  const redis = getRedis();

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const id = generateId();
    const created = await redis.set(keyFor(id), data, {
      nx: true,
      ex: CARD_TTL_SECONDS,
    });
    if (created) return id;
  }

  throw new Error("Could not generate a unique link, please try again.");
}

export async function getCard(id: string): Promise<CardData | null> {
  const redis = getRedis();
  const data = await redis.get<CardData>(keyFor(id));
  return data ?? null;
}
