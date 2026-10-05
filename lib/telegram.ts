/**
 * Telegram daily card (FEATURES.md #47): one post a day to the owner's
 * channel through the free Bot API's sendPhoto, called by
 * GET /api/cron/telegram. No paid API, no runtime AI: the photo is this
 * site's own share card (app/og) and the caption is built from the Khmer
 * calendar engine.
 *
 * Secrets: TELEGRAM_BOT_TOKEN goes into the request URL (that is how the Bot
 * API works), so the URL is never logged and errors are logged by status or
 * error name only.
 *
 * TELEGRAM_API_BASE points the client at a mock for local tests. It is
 * honoured outside production, and in production only when it names this
 * machine (localhost / 127.0.0.1 / ::1), so a typo or a planted variable can
 * never send the bot token to another host (CamboMath's R2_ENDPOINT rule,
 * narrowed so `next start` can still be tested against a local mock).
 */
import { getDb } from "./db";
import { khmerDay } from "./khmer";
import { fullDate } from "./dates";
import { dateInZone } from "./today";
import { DEFAULT_TZ, SITE_NAME, SITE_URL } from "./site";
import { localePath } from "./i18n";

const DEFAULT_API = "https://api.telegram.org";
const LAST_POSTED_KEY = "telegram_last_posted";
const TIMEOUT_MS = 10_000;

export interface TelegramConfig { token: string; chatId: string; api: string }

const TOKEN_RE = /^\d{5,15}:[A-Za-z0-9_-]{30,64}$/;
const CHAT_RE = /^(-?\d{1,20}|@[A-Za-z][A-Za-z0-9_]{4,31})$/;

function apiBase(): string {
  const raw = process.env.TELEGRAM_API_BASE;
  if (!raw) return DEFAULT_API;
  try {
    const u = new URL(raw);
    // Tests only: in production the token must only ever go to Telegram over
    // https (security review 2026-10-05), the same rule as CamboMath's R2_ENDPOINT.
    if (process.env.NODE_ENV === "production") return DEFAULT_API;
    if (u.protocol !== "http:" && u.protocol !== "https:") return DEFAULT_API;
    return u.origin;
  } catch {
    return DEFAULT_API;
  }
}

/** null when the feature is not configured (the route answers 503). */
export function telegramConfig(): TelegramConfig | null {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID ?? "";
  if (!TOKEN_RE.test(token) || !CHAT_RE.test(chatId)) return null;
  return { token, chatId, api: apiBase() };
}

/** Today's post: the Khmer share card and a short caption in both languages. */
export function dailyPost(date: string): { photo: string; caption: string } {
  const kd = khmerDay(date);
  const km = [`${fullDate(date, "km")}`, kd.labelKmShort, kd.festival ? kd.festival.km : kd.sila ? "ថ្ងៃសីល" : ""].filter(Boolean).join(" · ");
  const en = [fullDate(date, "en"), kd.labelEn, kd.festival ? kd.festival.en : kd.sila ? "Buddhist holy day" : ""].filter(Boolean).join(" · ");
  const caption = [
    km,
    `ហោរាសាស្ត្រ ថ្ងៃល្អ និងប្រតិទិនខ្មែរថ្ងៃនេះ៖ ${SITE_URL}${localePath("/khmer", "km")}`,
    "",
    en,
    `Today's horoscopes, lucky days and the Khmer calendar: ${SITE_URL}/khmer`,
    "",
    `${SITE_NAME} · For entertainment and reflection.`,
  ].join("\n");
  // The date in the URL makes each day's card a new URL, so Telegram does not reuse yesterday's.
  return { photo: `${SITE_URL}/og/default?lang=km&d=${date}`, caption };
}

export const today = () => dateInZone(DEFAULT_TZ);

export function lastPosted(): string | null {
  const row = getDb().prepare("SELECT value FROM app_settings WHERE key = ?").get(LAST_POSTED_KEY) as { value: string } | undefined;
  return row?.value ?? null;
}

function markPosted(date: string): void {
  getDb().prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(LAST_POSTED_KEY, date);
}

export type PostResult = { posted: true; date: string } | { posted: false; date: string; reason: "already-posted" } | { posted: false; date: string; reason: "send-failed"; status: number | string };

/** Posts today's card once per day (Asia/Phnom_Penh). Idempotent. */
export async function postDailyCard(cfg: TelegramConfig, date = today()): Promise<PostResult> {
  if (lastPosted() === date) return { posted: false, date, reason: "already-posted" };
  const { photo, caption } = dailyPost(date);
  let status: number | string;
  try {
    const res = await fetch(`${cfg.api}/bot${cfg.token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: cfg.chatId, photo, caption }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "error",
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (res.ok && body?.ok === true) {
      markPosted(date);
      return { posted: true, date };
    }
    status = res.status;
  } catch (err) {
    // The error name only: a message could carry the request URL, which holds the token.
    status = err instanceof Error ? err.name : "error";
    // A timeout leaves the outcome unknown: Telegram may already have posted.
    // Count the day as done so a retry cannot post the same card twice; a
    // missed day is the calmer failure (security review 2026-10-05).
    if (status === "TimeoutError" || status === "AbortError") markPosted(date);
  }
  return { posted: false, date, reason: "send-failed", status };
}
