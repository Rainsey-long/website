import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
export default async function RxIndex() {
  redirect(localePath(`/sky/retrogrades/${(await today()).slice(0, 4)}`, await getLang()));
}
