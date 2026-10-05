import { redirect } from "next/navigation";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
/** This year's solar terms, in the visitor's own year. */
export default async function SolarTermsIndex() {
  redirect(`/sky/solar-terms/${(await today()).slice(0, 4)}`);
}
