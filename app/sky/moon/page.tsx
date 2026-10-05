import { redirect } from "next/navigation";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
export default async function MoonIndex() {
  const t = await today();
  redirect(`/sky/moon/${t.slice(0, 4)}/${t.slice(5, 7)}`);
}
