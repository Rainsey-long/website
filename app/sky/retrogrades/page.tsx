import { redirect } from "next/navigation";
import { today } from "@/lib/today";
export const dynamic = "force-dynamic";
export default async function RxIndex() {
  redirect(`/sky/retrogrades/${(await today()).slice(0, 4)}`);
}
