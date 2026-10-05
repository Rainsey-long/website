/**
 * /ads.txt (IAB): names Google as an authorised seller once the AdSense
 * account id is configured (lib/ads.ts). 404 until then, so no placeholder
 * file claims a seller that does not exist.
 */
import { adsTxt } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
  const body = adsTxt();
  if (!body) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
