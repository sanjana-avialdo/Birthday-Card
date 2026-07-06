import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/store";
import { BirthdayCard } from "@/components/BirthdayCard";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getCard(id).catch(() => null);

  if (!data) return { title: "Birthday surprise" };

  return {
    title: `${data.title || "Happy Birthday"}${data.name ? ` — ${data.name}` : ""}`,
    description: data.message || "You have a birthday surprise waiting for you.",
  };
}

export default async function ShortCardPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getCard(id).catch(() => null);

  if (!data) notFound();

  return <BirthdayCard data={data} />;
}
