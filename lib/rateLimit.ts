// Fixed-window request throttle, keyed by caller-supplied string (typically
// an IP). In-memory is fine here — this app runs as a single Node process,
// not distributed edge functions. See lib/auth.ts's login limiter, the
// original instance of this pattern; extracted here so a second public
// write endpoint (worksheets) can share the same proven throttle instead of
// going unrated.
export type RateLimiter = ((key: string) => boolean) & {
  /**
   * Is this key ALREADY over its cap? Does not count as an attempt.
   *
   * Exists so a caller can gate on the limit before doing expensive or
   * destructive work without that gate itself consuming the caller's budget.
   * `POST /api/admin/login` needs exactly this: it must refuse a username
   * that is already locked, but must not spend one of that username's ten
   * attempts merely by asking.
   */
  peek: (key: string) => boolean;
  /**
   * Forget this key entirely, restoring a full budget.
   *
   * The point is that a limiter counting *successes* is a denial-of-service
   * primitive rather than a control: the legitimate holder of an account is
   * the party who succeeds, so counting their successes locks out precisely
   * the person the limit exists to protect. A caller that can distinguish
   * success from failure resets on success and counts only failures.
   */
  reset: (key: string) => void;
};

/**
 * Bounds on the key table, which are a SECURITY control rather than tidiness.
 *
 * Without them this Map only ever replaced an entry when the SAME key came
 * back after its window expired — so a key that never returns is retained for
 * the life of the process. `clientIp()` below falls back to a User-Agent +
 * Accept-Language hash when no trusted proxy is configured (the default), and
 * both of those are chosen by the caller: one unauthenticated host rotating a
 * header allocates a permanent entry per request. Measured against the real
 * module: 200,000 requests with a fresh User-Agent each produced zero refusals
 * and retained 38.6 MB, held until restart. This app is a single Node process
 * with a local SQLite file, so exhausting its heap is a total outage.
 *
 * Two bounds, because neither alone is enough:
 *
 *  - GC_THRESHOLD triggers a sweep of EXPIRED entries. It handles the ordinary
 *    case (lots of distinct real callers over a day) at the cost of one scan
 *    per insert once the table is big, which is the same shape and the same
 *    threshold-gated approach lib/downloadToken.ts's gcExpired() already uses.
 *  - MAX_KEYS is the backstop the sweep cannot provide: entries inside their
 *    window are not expired, so a fast enough attacker outruns the sweep. Past
 *    this size a key that is not already present is REFUSED rather than
 *    inserted, which caps one limiter at roughly 2 MB.
 *
 * Refusing means a genuinely new caller can be told 429 while an attack is
 * saturating the table. That trade is deliberate and is the same one
 * GLOBAL_LIMIT_KEY below already documents — a bounded denial beats an
 * unbounded one, and an OOM denies the whole site to everyone permanently.
 */
const GC_THRESHOLD = 1_000;
const MAX_KEYS = 10_000;

export function createRateLimiter(
  windowMs: number,
  maxAttempts: number,
  /** Override MAX_KEYS for a limiter whose legitimate key count can exceed it
   *  — a per-caller bucket under a global ceiling larger than 10,000. */
  maxKeys: number = MAX_KEYS
): RateLimiter {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  const gcExpired = (now: number) => {
    if (attempts.size < GC_THRESHOLD) return;
    for (const [k, entry] of attempts) {
      if (now > entry.resetAt) attempts.delete(k);
    }
  };

  const isRateLimited = (key: string): boolean => {
    const now = Date.now();
    const entry = attempts.get(key);
    // The common path, and deliberately first: an existing live window is
    // counted without touching the table's size at all.
    if (entry && now <= entry.resetAt) {
      entry.count += 1;
      return entry.count > maxAttempts;
    }
    // New key, or one whose window has rolled — the only two cases that can
    // grow the table, so the bounds are enforced exactly here.
    gcExpired(now);
    if (entry === undefined && attempts.size >= maxKeys) return true;
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  };

  isRateLimited.peek = (key: string): boolean => {
    const entry = attempts.get(key);
    if (!entry || Date.now() > entry.resetAt) return false;
    return entry.count > maxAttempts;
  };

  isRateLimited.reset = (key: string): void => {
    attempts.delete(key);
  };

  return isRateLimited;
}

/**
 * The key to use for a limiter that bounds TOTAL throughput rather than
 * per-caller throughput.
 *
 * Why this exists: `clientIp()` below cannot produce a forge-proof per-caller
 * key without a trusted proxy, so every per-caller limit in this app is
 * defeated by rotating one request header. Measured against
 * `POST /api/reports` (cap 20/10min): a fixed User-Agent was blocked after
 * 20 requests; a User-Agent that changed per request completed all 26 with
 * zero refusals.
 *
 * A global ceiling is immune to that, because there is no key to rotate — an
 * attacker forging every header still lands in the same bucket. The cost is
 * that a sufficiently determined attacker can exhaust the ceiling and deny
 * the endpoint to genuine users, so this belongs ONLY on endpoints where
 * that trade is worth it: expensive work (disk reads, zip construction,
 * scrypt) or unbounded writes. It is a backstop against resource exhaustion,
 * NOT a substitute for a real per-client limit — the durable fix for that is
 * setting `TRUSTED_PROXY_HOPS` to the deployment's real hop count.
 */
export const GLOBAL_LIMIT_KEY = "__global__";

/**
 * How many TRUSTED reverse-proxy hops sit in front of this app.
 *
 * `x-forwarded-for` is a `client, proxy1, proxy2, …` chain where each hop
 * APPENDS the peer it observed. Only the entries appended by infrastructure
 * you actually control are trustworthy; everything to the left of those is
 * whatever the client chose to send.
 *
 * DEFAULTS TO 0, meaning "ignore the header entirely", and that default is
 * the fix for a confirmed vulnerability rather than a conservative guess.
 * This previously read the LAST entry unconditionally, which fails in both
 * directions at once — measured live against `POST /api/reports` (limit
 * 20/10min):
 *
 *   - 30 requests with a ROTATING `X-Forwarded-For` → 29 succeeded. A single
 *     spoofed header per request defeated the limiter completely, with no
 *     account and no proxy involved.
 *   - 24 requests with NO `X-Forwarded-For` → all collapsed into one shared
 *     `"unknown"` bucket. With no proxy in front, every genuine visitor
 *     shares one ceiling, so a Cambodian computer lab gets 20 reports per
 *     10 minutes between them while an attacker gets no ceiling at all.
 *
 * So the control was throttling classrooms and not adversaries. Failing
 * closed here means an unconfigured deployment keys on something a client
 * cannot forge; a deployment that really does sit behind N trusted proxies
 * sets `TRUSTED_PROXY_HOPS=N` and gets accurate per-client keys back.
 */
const TRUSTED_PROXY_HOPS = Math.max(
  0,
  Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "0", 10) || 0
);

/**
 * A rate-limit key for this caller.
 *
 * With `TRUSTED_PROXY_HOPS` unset we deliberately do NOT fall back to a
 * single shared constant — that is what created the "everyone shares one
 * bucket" half of the bug above. Instead the key is derived from request
 * properties that are stable for a given browser.
 *
 * BE CLEAR ABOUT WHAT THIS IS WORTH: an earlier version of this comment
 * claimed the fallback "raises the cost of the trivial header-rotation
 * bypass." Measured, it does not. Against `POST /api/reports` (cap 20/10min)
 * from a single host: a fixed `User-Agent` was refused after 20 requests; a
 * `User-Agent` that changed per request completed all 26 with zero refusals.
 * Swapping `X-Forwarded-For` for `User-Agent` swapped one trivially forged
 * header for another — same one-line bypass, same cost. It also does not fix
 * the classroom half: identical school laptops send an identical UA and
 * `Accept-Language`, so they still share one bucket.
 *
 * So treat any per-caller limit in this app as effective against accidents
 * and unsophisticated scripts only, and NOT as a control against a
 * deliberate attacker, until `TRUSTED_PROXY_HOPS` is set to the deployment's
 * real hop count. Two things close the gap in the meantime, and both are
 * used in this codebase rather than left as advice:
 *   - a second, non-forgeable dimension at the call site (`/api/admin/login`
 *     also keys on the submitted username, which an attacker must hold
 *     constant to make progress);
 *   - a `GLOBAL_LIMIT_KEY` ceiling on expensive endpoints, which has no key
 *     to rotate at all.
 */
export function clientIp(req: Request): string {
  if (TRUSTED_PROXY_HOPS > 0) {
    const chain = req.headers
      .get("x-forwarded-for")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (chain && chain.length > 0) {
      // Count back from the right: the rightmost entry was appended by the
      // hop nearest us, so hop N back is the last one we still trust.
      const idx = Math.max(0, chain.length - TRUSTED_PROXY_HOPS);
      return chain[idx] ?? chain[0];
    }
  }
  // No trusted proxy configured. Bucket on properties that are stable for a
  // given client but are not a single global constant.
  const ua = req.headers.get("user-agent") ?? "";
  const al = req.headers.get("accept-language") ?? "";
  return `ua:${ua.slice(0, 120)}|al:${al.slice(0, 40)}`;
}
