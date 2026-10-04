import { cookies } from "next/headers";
import { parseTraditions, TRADITIONS_COOKIE, type Tradition } from "./traditions";

export async function chosenTraditions(): Promise<Tradition[]> {
  return parseTraditions((await cookies()).get(TRADITIONS_COOKIE)?.value);
}
