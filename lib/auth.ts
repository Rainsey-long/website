/**
 * Admin authentication — the CamboMath design, unchanged where it matters:
 *  - scrypt hashes, self-describing (scrypt$N$salt$hash), constant-time compare;
 *  - a hashed dummy for unknown usernames so timing can't enumerate accounts;
 *  - session = `<base64url payload>.<HMAC-SHA256>` keyed by AUTH_SECRET in an
 *    httpOnly cookie, `__Host-` prefixed in production;
 *  - every request re-reads the users row and refuses the token unless the
 *    account still exists and its session_epoch matches, so sign-out and
 *    password changes revoke every copy of the token.
 * There are no visitor accounts on this site. Admin is the only identity.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

/** One password floor for every place a password is set. */
export const ADMIN_PASSWORD_MIN = 12;

const SCRYPT_COST = 16384;
const KEY_LEN = 64;
const SESSION_HOURS = 8;
const COOKIE_BASE = "al_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN, { N: SCRYPT_COST });
  return `scrypt$${SCRYPT_COST}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  let actual: Buffer;
  try {
    actual = scryptSync(password, salt, expected.length || KEY_LEN, { N });
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? `__Host-${COOKIE_BASE}` : COOKIE_BASE;
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (>=16 chars) in production");
  return "dev-only-insecure-secret-change-me";
}

export type Session = { uid: number; username: string; epoch: number; exp: number };

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function createSessionToken(s: Omit<Session, "exp">): string {
  const body = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + SESSION_HOURS * 3600_000 })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  // base64url only, BEFORE the MAC check (CamboMath security.md: structural domain separation).
  if (!body || !mac || !/^[A-Za-z0-9_-]+$/.test(body)) return null;
  const a = Buffer.from(mac);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (typeof s.exp !== "number" || !Number.isFinite(s.exp) || s.exp < Date.now()) return null;
    if (typeof s.uid !== "number" || !Number.isInteger(s.uid)) return null;
    if (typeof s.epoch !== "number" || !Number.isInteger(s.epoch)) return null;
    return s;
  } catch {
    return null;
  }
}

export function authenticate(username: string, password: string): Omit<Session, "exp"> | null {
  const user = getDb()
    .prepare("SELECT id, username, password_hash, session_epoch FROM users WHERE username = ?")
    .get(username.trim()) as { id: number; username: string; password_hash: string; session_epoch: number } | undefined;
  // Hash even for an unknown user so response time does not reveal which usernames exist.
  const ok = verifyPassword(password, user?.password_hash ?? "scrypt$16384$00$00");
  if (!ok || !user) return null;
  return { uid: user.id, username: user.username, epoch: user.session_epoch };
}

/** The signed-in admin, re-validated against the users row on every call. Denies on a DB error. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const s = readSessionToken(store.get(sessionCookieName())?.value);
  if (!s) return null;
  try {
    const row = getDb().prepare("SELECT session_epoch FROM users WHERE id = ?").get(s.uid) as { session_epoch: number } | undefined;
    if (!row || row.session_epoch !== s.epoch) return null;
  } catch (err) {
    console.error("[auth] session check failed", err);
    return null;
  }
  return s;
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Revoke every outstanding token for this account (sign-out, password change). */
export function bumpSessionEpoch(uid: number): void {
  getDb().prepare("UPDATE users SET session_epoch = session_epoch + 1 WHERE id = ?").run(uid);
}

export const SESSION_MAX_AGE = SESSION_HOURS * 3600;
