/**
 * Tiny browser helpers shared by page scripts. Every storage access is
 * wrapped in try/catch: private windows and blocked storage must not break pages.
 */
export function readStore(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writeStore(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* storage unavailable: the page still works, it just forgets */ }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** Bottom-centre toast that says what happened; auto-dismisses after 4s (§6.14). */
export function toast(message: string): void {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

/** Visitor's local calendar date as YYYY-MM-DD (§8.5: local date for "today"). */
export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const MY_SIGN_KEY = "mySign";

/** First-party preference cookie (1 year, Lax). Values are short tokens we validate server-side. */
export function setCookie(name: string, value: string): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export const SIGN_NAMES: Record<string, string> = {
  aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", scorpio: "Scorpio", sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
};

/** Same-tab broadcast when the remembered sign changes. */
export const MY_SIGN_EVENT = "mysign:change";
