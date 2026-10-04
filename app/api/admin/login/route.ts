/**
 * Admin sign-in / sign-out. Rate limiting follows CamboMath's measured fix:
 * a global ceiling gates pre-parse; the per-caller and per-username buckets
 * are PEEKED before authenticating and COUNTED only on failure, so the
 * correct password always works and resets both (a limiter that refuses
 * correct credentials is a lock-out primitive).
 */
import { cookies } from "next/headers";
import { authenticate, bumpSessionEpoch, createSessionToken, getSession, SESSION_MAX_AGE, sessionCookieName } from "@/lib/auth";
import { GLOBAL_LIMIT_KEY, clientIp, createRateLimiter } from "@/lib/rateLimit";
import { json, readJsonCapped, requestLang, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";
import { seedIfEmpty } from "@/lib/seed";

const globalLimit = createRateLimiter(10 * 60_000, 200);
const ipLimit = createRateLimiter(10 * 60_000, 10);
const userLimit = createRateLimiter(10 * 60_000, 10);

/** Wording only; the caller's language comes from `?lang=` (lib/http.ts requestLang). */
const T = defineMessages({
  en: {
    forbidden: "Forbidden",
    tooMany: "Too many attempts. Try again later.",
    enterBoth: "Enter your username and password.",
    noMatch: "That username and password don't match.",
  },
  km: {
    forbidden: "មិនអនុញ្ញាតទេ។",
    tooMany: "ព្យាយាមច្រើនដងពេក។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។",
    enterBoth: "សូមបញ្ចូលឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់។",
    noMatch: "ឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់មិនត្រូវគ្នាទេ។",
  },
});

export async function POST(req: Request) {
  const t = T[requestLang(req)];
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  if (globalLimit(GLOBAL_LIMIT_KEY)) return json({ error: t.tooMany }, 429);
  const body = await readJsonCapped<{ username?: unknown; password?: unknown }>(req, 2048);
  if (!body.ok) return body.res;
  const { username, password } = body.value;
  if (typeof username !== "string" || typeof password !== "string" || !username || !password || username.length > 64 || password.length > 256) {
    return json({ error: t.enterBoth }, 400);
  }
  seedIfEmpty();
  const ip = clientIp(req), user = username.trim().toLowerCase();
  const ipLocked = ipLimit.peek(ip), userLocked = userLimit.peek(user);
  const id = authenticate(username, password);
  if (!id) {
    ipLimit(ip);
    userLimit(user);
    if (ipLocked || userLocked) return json({ error: t.tooMany }, 429);
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
  if (!sameOrigin(req)) return json({ error: T[requestLang(req)].forbidden }, 403);
  const s = await getSession();
  if (s) bumpSessionEpoch(s.uid);
  (await cookies()).set(sessionCookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return json({ ok: true });
}
