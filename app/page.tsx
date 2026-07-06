import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCard } from "@/lib/store";
import { BirthdayCard } from "@/components/BirthdayCard";

// Always read CARD_ID and the database at request time — otherwise Next would
// prerender this page once at build time and freeze whatever it saw then.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cardId = process.env.CARD_ID;
  if (!cardId) return {};

  const data = await getCard(cardId).catch(() => null);
  if (!data) return {};

  return {
    title: `${data.title || "Happy Birthday"}${data.name ? ` — ${data.name}` : ""}`,
    description: data.message || "You have a birthday surprise waiting for you.",
  };
}

export default async function Home() {
  const cardId = process.env.CARD_ID;
  if (!cardId) redirect("/builder");

  const data = await getCard(cardId).catch(() => null);
  if (!data) redirect("/builder");

  return <BirthdayCard data={data} />;
}
