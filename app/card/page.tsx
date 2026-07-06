import type { Metadata } from "next";
import { decodeCardData } from "@/lib/query";
import { BirthdayCard } from "@/components/BirthdayCard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const data = decodeCardData(sp);
  return {
    title: `${data.title || "Happy Birthday"}${data.name ? ` — ${data.name}` : ""}`,
    description: data.message || "You have a birthday surprise waiting for you.",
  };
}

export default async function CardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const data = decodeCardData(sp);

  return <BirthdayCard data={data} />;
}
