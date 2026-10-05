import { redirect } from "next/navigation";
import { localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
/** This year's solar terms, in the visitor's own year. */
export default async function SolarTermsIndex() {
  redirect(localePath(`/sky/solar-terms/${(await today()).slice(0, 4)}`, await getLang()));
}
