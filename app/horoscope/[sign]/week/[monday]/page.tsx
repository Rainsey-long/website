/** A dated weekly horoscope: any Monday 1900–2100 renders; recent weeks are indexed (lib/weeklyMeta.ts). */
import { notFound } from "next/navigation";
import WeeklyPage from "@/components/WeeklyPage";
import { signBySlug } from "@/lib/western";
import { validWeek, weeklyMetadata } from "@/lib/weeklyMeta";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ sign: string; monday: string }> };

export async function generateMetadata({ params }: Params) {
  const { sign: s, monday } = await params;
  const sign = signBySlug(s);
  if (!sign || !validWeek(monday)) return {};
  return weeklyMetadata(sign, monday, await getLang(), `/horoscope/${sign.slug}/week/${monday}`);
}

export default async function DatedWeek({ params }: Params) {
  const { sign: s, monday } = await params;
  const sign = signBySlug(s);
  if (!sign || !validWeek(monday)) notFound();
  return <WeeklyPage sign={sign} monday={monday} />;
}
