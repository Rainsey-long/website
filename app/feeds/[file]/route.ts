/** Subscribable .ics feeds. Public, cacheable, no personal data; global rate ceiling like CamboMath's sitemap. */
import { FEEDS, feedEvents, toIcs, type FeedName } from "@/lib/ics";
import { GLOBAL_LIMIT_KEY, createRateLimiter } from "@/lib/rateLimit";
import { dateInZone } from "@/lib/today";
import { DEFAULT_TZ } from "@/lib/site";

export const dynamic = "force-dynamic";
const limiter = createRateLimiter(10 * 60_000, 600);
const memo = new Map<string, { at: number; body: string }>();

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = file.replace(/\.ics$/, "");
  if (!file.endsWith(".ics") || !Object.prototype.hasOwnProperty.call(FEEDS, name)) return new Response("Not found", { status: 404 });
  if (limiter(GLOBAL_LIMIT_KEY)) return new Response("Busy, try again shortly", { status: 429, headers: { "Retry-After": "60" } });
  const year = Number(dateInZone(DEFAULT_TZ).slice(0, 4));
  // ?lang=km serves the Khmer edition; anything else is English (bounded memo: 5 feeds × 2 languages, plus the eve edition).
  const lang = new URL(req.url).searchParams.get("lang") === "km" ? "km" : "en";
  // ?eve=1 (holy-day feed only) adds a note the day before each holy day.
  const eve = name === "khmer-holy-days" && new URL(req.url).searchParams.get("eve") === "1";
  const key = `${name}:${lang}:${year}:${eve ? "eve" : ""}`;
  let hit = memo.get(key);
  if (!hit || Date.now() - hit.at > 6 * 3600_000) {
    const feed = FEEDS[name as FeedName];
    hit = { at: Date.now(), body: toIcs(lang === "km" ? feed.titleKm : feed.title, feedEvents(name as FeedName, year - 1, year + 2, lang, { eve }), lang) };
    memo.set(key, hit);
  }
  return new Response(hit.body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=21600", "Content-Disposition": `inline; filename="${name}${eve ? "-eve" : ""}${lang === "km" ? "-km" : ""}.ics"` } });
}
