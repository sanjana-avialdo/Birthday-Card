import postgres from "postgres";
import type { CardData } from "./types";

const ID_LENGTH = 8;
const MAX_CREATE_ATTEMPTS = 5;

let sql: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function getSql() {
  if (sql) return sql;

  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      "Missing Postgres connection string. Set POSTGRES_URL (see .env.local.example) — " +
        "on Vercel/Supabase, this is injected automatically once the integration is connected."
    );
  }

  sql = postgres(connectionString, {
    // Supabase's connection-pooler runs in transaction mode, which doesn't
    // support prepared statements across queries.
    prepare: false,
    // One query at a time per request — no need for a bigger pool per instance.
    max: 1,
  });
  return sql;
}

// Lazily created on first use so there's no separate migration step to run —
// memoized per warm serverless instance, so it's a no-op after the first call.
async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const client = getSql();
    schemaReady = client`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  await schemaReady;
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, ID_LENGTH);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

export async function saveCard(data: CardData): Promise<string> {
  const client = getSql();
  await ensureSchema();
  const json = JSON.stringify(data);

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const id = generateId();
    try {
      await client`INSERT INTO cards (id, data) VALUES (${id}, ${json})`;
      return id;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }

  throw new Error("Could not generate a unique link, please try again.");
}

export async function getCard(id: string): Promise<CardData | null> {
  const client = getSql();
  await ensureSchema();
  const rows = await client`SELECT data FROM cards WHERE id = ${id}`;
  const row = rows[0] as { data: string } | undefined;
  if (!row) return null;

  try {
    return JSON.parse(row.data) as CardData;
  } catch {
    return null;
  }
}
