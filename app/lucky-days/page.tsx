import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { today } from "@/lib/today";

export const dynamic = "force-dynamic";

/** Lucky days opens on the visitor's current month. */
export default async function LuckyDaysIndex() {
  const t = await today();
  redirect(localePath(`/lucky-days/${t.slice(0, 4)}/${t.slice(5, 7)}`, await getLang()));
}
