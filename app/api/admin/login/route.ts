/**
 * Admin sign-in / sign-out. Rate limiting follows CamboMath's measured fix:
 * the global, per-caller and per-username buckets are all PEEKED before
 * authenticating and COUNTED only on failure, so the correct password always
 * works (a limiter that refuses correct credentials is a lock-out
 * primitive). The global bucket used to gate every request before parsing,
 * which let 200 anonymous POSTs lock the owner out for ten minutes, again and
 * again (security audit 2026-10-05). With a forgeable caller key, the global
 * failure ceiling is the real guessing limit: about 28,800 wrong guesses a
 * day against a 12-character minimum password.
 */
import { cookies } from "next/headers";
import { authenticate, bumpSessionEpoch, createSessionToken, getSession, SESSION_MAX_AGE, sessionCookieName } from "@/lib/auth";
import { GLOBAL_LIMIT_KEY, clientIp, createRateLimiter } from "@/lib/rateLimit";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";
import { seedIfEmpty } from "@/lib/seed";

const globalLimit = createRateLimiter(10 * 60_000, 200);
const ipLimit = createRateLimiter(10 * 60_000, 10);
const userLimit = createRateLimiter(10 * 60_000, 10);

const T = defineMessages({
  en: {
    forbidden: "Forbidden",
    tooMany: "Too many attempts. Try again later.",
    enterBoth: "Enter your username and password.",
    noMatch: "That username and password don't match.",
  },
});

export async function POST(req: Request) {
  const t = T.en;
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  const body = await readJsonCapped<{ username?: unknown; password?: unknown }>(req, 2048);
  if (!body.ok) return body.res;
  const { username, password } = body.value;
  if (typeof username !== "string" || typeof password !== "string" || !username || !password || username.length > 64 || password.length > 256) {
    return json({ error: t.enterBoth }, 400);
  }
  seedIfEmpty();
  const ip = clientIp(req), user = username.trim().toLowerCase();
  const globalLocked = globalLimit.peek(GLOBAL_LIMIT_KEY), ipLocked = ipLimit.peek(ip), userLocked = userLimit.peek(user);
  const id = authenticate(username, password);
  if (!id) {
    globalLimit(GLOBAL_LIMIT_KEY);
    ipLimit(ip);
    userLimit(user);
    if (globalLocked || ipLocked || userLocked) return json({ error: t.tooMany }, 429);
    return json({ error: t.noMatch }, 401);
  }
  ipLimit.reset(ip);
  userLimit.reset(user);
  (await cookies()).set(sessionCookieName(), createSessionToken(id), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_MAX_AGE,
  });
  return json({ ok: true });
}

/** Sign-out revokes, it does not only clear: every copy of the token stops working. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: T.en.forbidden }, 403);
  const s = await getSession();
  if (s) bumpSessionEpoch(s.uid);
  (await cookies()).set(sessionCookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return json({ ok: true });
}
