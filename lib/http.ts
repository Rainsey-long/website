/**
 * Request helpers shared by API routes (CamboMath security.md rules):
 *  - measure the RAW body before parsing — a cap on the stored value is not a cap on the heap;
 *  - generic errors to the caller, details to the server log;
 *  - same-origin check on state-changing requests.
 */
import { NextResponse } from "next/server";
import { SITE_URL } from "./site";
import type { Lang } from "./i18n";

export async function readJsonCapped<T>(req: Request, maxBytes: number): Promise<{ ok: true; value: T } | { ok: false; res: NextResponse }> {
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) return { ok: false, res: NextResponse.json({ error: "Too large" }, { status: 413 }) };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, res: NextResponse.json({ error: "Bad request" }, { status: 400 }) };
  }
  // Every caller destructures an object. `null` (valid JSON) used to throw on
  // destructuring and surface as an unhandled 500, reachable anonymously via
  // /api/feedback; arrays and primitives are refused here for the same reason.
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, res: NextResponse.json({ error: "Bad request" }, { status: 400 }) };
  }
  return { ok: true, value: value as T };
}

/** Refuse cross-site state changes. Browsers always send Origin on POST/PATCH/PUT/DELETE fetches. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const o = new URL(origin).host;
    const allowed = [new URL(SITE_URL).host, req.headers.get("host"), req.headers.get("x-forwarded-host")];
    return allowed.includes(o);
  } catch {
    return false;
  }
}

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * The caller's language for messages an API route sends back to a person
 * (admin forms). API URLs carry no /km prefix, so a Khmer page asks with
 * `?lang=km`; anything else is English. Never used for anything but wording.
 */
export function requestLang(req: Request): Lang {
  return new URL(req.url).searchParams.get("lang") === "km" ? "km" : "en";
}
