/** The request's language on the server, set by proxy.ts (lib/i18n.ts). */
import { headers } from "next/headers";
import { isLang, LANG_HEADER, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const v = (await headers()).get(LANG_HEADER);
  return isLang(v) ? v : "en";
}
