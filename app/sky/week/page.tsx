import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { today } from "@/lib/today";
import { mondayOf } from "@/lib/weekly";
export const dynamic = "force-dynamic";
/** This week in the sky: the week holding the visitor's today. */
export default async function SkyWeekIndex() {
  redirect(localePath(`/sky/week/${mondayOf(await today())}`, await getLang()));
}
