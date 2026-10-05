/**
 * Next 16 proxy (formerly middleware). Header and path work only — it makes no
 * network call and must never start: it runs before every request.
 *  - AI training crawlers get a 403 (CamboMath lib/aiBots.ts list), except on
 *    /robots.txt so compliant bots can read their Disallow and leave.
 *  - Trailing slashes from the old static build redirect to the clean URL.
 *  - The Khmer language version was removed (2026-10-05): every /km and
 *    /km/x URL permanently redirects to its English page, so old links and
 *    search results keep working.
 */
import { NextResponse, type NextRequest } from "next/server";
import { AI_BOT_UA_PATTERN } from "@/lib/aiBots";
import { FEATURES } from "@/lib/site";
import { stripLocale } from "@/lib/i18n";

// Next requires an absolute Location here. The origin comes from the configured
// NEXT_PUBLIC_SITE_URL (set in production, docs/RAILWAY.md) and never from a
// request header there; only a local run without it falls back to the
// request's own origin (CamboMath's redirectOrigin rule).
const CONFIGURED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : null;
const go = (request: NextRequest, location: string, status: 307 | 308) =>
  NextResponse.redirect(new URL(location, CONFIGURED_ORIGIN ?? request.nextUrl.origin), status);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (FEATURES.BLOCK_AI_CRAWLERS && pathname !== "/robots.txt" && AI_BOT_UA_PATTERN.test(request.headers.get("user-agent") ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return go(request, pathname.replace(/\/+$/, "") + search, 308);
  }

  const { path, wasKhmer } = stripLocale(pathname);
  if (wasKhmer) return go(request, path + search, 308);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
