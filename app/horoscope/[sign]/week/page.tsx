/** This week's horoscope for a sign (lib/weekly.ts), by the visitor's local date. */
import { notFound } from "next/navigation";
import WeeklyPage from "@/components/WeeklyPage";
import { signBySlug } from "@/lib/western";
import { mondayOf } from "@/lib/weekly";
import { weeklyMetadata } from "@/lib/weeklyMeta";
import { today } from "@/lib/today";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: Params) {
  const { sign: s } = await params;
  const sign = signBySlug(s);
  if (!sign) return {};
  return weeklyMetadata(sign, mondayOf(await today()), await getLang(), `/horoscope/${sign.slug}/week`);
}

export default async function ThisWeek({ params }: Params) {
  const { sign: s } = await params;
  const sign = signBySlug(s);
  if (!sign) notFound();
  return <WeeklyPage sign={sign} monday={mondayOf(await today())} />;
}
