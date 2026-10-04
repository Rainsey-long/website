/**
 * Request helpers shared by API routes (CamboMath security.md rules):
 *  - measure the RAW body before parsing — a cap on the stored value is not a cap on the heap;
 *  - generic errors to the caller, details to the server log;
 *  - same-origin check on state-changing requests.
 */
import { NextResponse } from "next/server";
import { SITE_URL } from "./site";

export async function readJsonCapped<T>(req: Request, maxBytes: number): Promise<{ ok: true; value: T } | { ok: false; res: NextResponse }> {
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) return { ok: false, res: NextResponse.json({ error: "Too large" }, { status: 413 }) };
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, res: NextResponse.json({ error: "Bad request" }, { status: 400 }) };
  }
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
