/**
 * Next 16 proxy (formerly middleware). Header and path work only — it makes no
 * network call and must never start: it runs before every request.
 *  - AI training crawlers get a 403 (CamboMath lib/aiBots.ts list), except on
 *    /robots.txt so compliant bots can read their Disallow and leave.
 *  - Trailing slashes from the old static build redirect to the clean URL.
 *  - Khmer (lib/i18n.ts): /km/x is rewritten to /x with the language in a
 *    request header; /km/admin goes to /admin (no Khmer twin); a visitor whose
 *    cookie says Khmer and who lands on an unprefixed page is sent to its /km
 *    twin. Crawlers carry no cookie, so they always see both URLs as they are.
 */
import { NextResponse, type NextRequest } from "next/server";
import { AI_BOT_UA_PATTERN } from "@/lib/aiBots";
import { FEATURES } from "@/lib/site";
import { isLocalisable, LANG_COOKIE, LANG_HEADER, localePath, stripLocale } from "@/lib/i18n";

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

  const { lang, path } = stripLocale(pathname);
  if (lang === "km" && !isLocalisable(path)) return go(request, path + search, 308);

  const readOnly = request.method === "GET" || request.method === "HEAD";
  if (lang === "en" && readOnly && isLocalisable(path) && request.cookies.get(LANG_COOKIE)?.value === "km") {
    return go(request, localePath(path, "km") + search, 307);
  }

  const forwarded = new Headers(request.headers);
  forwarded.set(LANG_HEADER, lang);
  if (lang === "km") {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url, { request: { headers: forwarded } });
  }
  return NextResponse.next({ request: { headers: forwarded } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
