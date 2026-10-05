/** The request's language on the server. The site is English only (lib/i18n.ts). */
import type { Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  return "en";
}
