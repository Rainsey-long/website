/**
 * Next 16 proxy (formerly middleware). Header and path work only — it makes no
 * network call and must never start: it runs before every request.
 *  - AI training crawlers get a 403 (CamboMath lib/aiBots.ts list), except on
 *    /robots.txt so compliant bots can read their Disallow and leave.
 *  - Trailing slashes from the old static build redirect to the clean URL.
 */
import { NextResponse, type NextRequest } from "next/server";
import { AI_BOT_UA_PATTERN } from "@/lib/aiBots";
import { FEATURES } from "@/lib/site";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (FEATURES.BLOCK_AI_CRAWLERS && pathname !== "/robots.txt" && AI_BOT_UA_PATTERN.test(request.headers.get("user-agent") ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    // Relative Location: resolved by the browser against the URL it requested, never a request-derived origin.
    return new NextResponse(null, { status: 308, headers: { Location: pathname.replace(/\/+$/, "") + request.nextUrl.search } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"],
};
