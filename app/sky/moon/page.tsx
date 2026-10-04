import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
export default async function MoonIndex() {
  const t = await today();
  redirect(localePath(`/sky/moon/${t.slice(0, 4)}/${t.slice(5, 7)}`, await getLang()));
}
