/**
 * Site search (lib/searchIndex.ts) and the Telegram daily card
 * (lib/telegram.ts). Names are the published ones (Khmer rasi and animal
 * names, Cambodia's 2025 Pchum Ben public holiday on 22 September).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalise, search, MAX_QUERY } from "@/lib/searchIndex";
import { dailyPost, telegramConfig } from "@/lib/telegram";

describe("search", () => {
  it("finds a sign in English, case-insensitively", () => {
    expect(search("ARIES")[0].href).toBe("/horoscope/aries");
  });
  it("finds a sign by its Khmer rasi name", () => {
    expect(search("មេស").map((r) => r.href)).toContain("/zodiac/aries");
  });
  it("matches Khmer by substring", () => {
    expect(search("ភ្ជុំ").some((r) => r.title.en === "Pchum Ben")).toBe(true);
  });
  it("ignores Latin diacritics and keeps Khmer vowel signs", () => {
    expect(normalise("Pchüm Bén")).toBe("pchum ben");
    expect(normalise("ភ្ជុំបិណ្ឌ")).toBe("ភ្ជុំបិណ្ឌ");
    expect(search("Sôngkran")[0].href).toBe("/khmer/new-year");
  });
  it("matches Latin words from their start only", () => {
    expect(search("rat").map((r) => r.href)).toEqual(["/chinese-zodiac/rat", "/chinese-zodiac/rat/2027"]);
  });
  it("needs every word to match", () => {
    expect(search("rat 2027").map((r) => r.href)).toEqual(["/chinese-zodiac/rat/2027"]);
    expect(search("zzzz")).toEqual([]);
  });
  it("caps the query", () => {
    expect(search("a".repeat(MAX_QUERY * 10))).toEqual([]);
  });
});

describe("telegram", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("names the festival in both languages", () => {
    const { caption, photo } = dailyPost("2025-09-22");
    expect(caption).toContain("ភ្ជុំបិណ្ឌ");
    expect(caption).toContain("Pchum Ben");
    expect(photo).toMatch(/\/og\/default\?lang=km&d=2025-09-22$/);
  });
  it("is off unless token and chat are well-formed", () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "@channel_name");
    expect(telegramConfig()).toBeNull();
  });
  it("never sends the token to a remote override in production", () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456789:" + "A".repeat(35));
    vi.stubEnv("TELEGRAM_CHAT_ID", "@channel_name");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TELEGRAM_API_BASE", "https://evil.example");
    expect(telegramConfig()?.api).toBe("https://api.telegram.org");
    // Localhost too: in production the token only ever goes to Telegram (security review 2026-10-05).
    vi.stubEnv("TELEGRAM_API_BASE", "http://127.0.0.1:3999");
    expect(telegramConfig()?.api).toBe("https://api.telegram.org");
    vi.stubEnv("NODE_ENV", "test");
    expect(telegramConfig()?.api).toBe("http://127.0.0.1:3999");
  });
});
