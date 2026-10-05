/**
 * AdSense gate (lib/ads.ts). The module reads NEXT_PUBLIC_* at import, so
 * each case stubs the environment and imports a fresh copy. The ads.txt line
 * is the format Google publishes (support.google.com/adsense/answer/12171612:
 * "google.com, pub-…, DIRECT, f08c47fec0942fa0").
 */
import { afterEach, describe, expect, it, vi } from "vitest";

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("@/lib/ads");
}
afterEach(() => vi.unstubAllEnvs());

describe("ads gate", () => {
  it("ships inert: nothing configured, nothing allowed", async () => {
    const a = await load({ NEXT_PUBLIC_AD_CLIENT_ID: "", NEXT_PUBLIC_ADSENSE_ACCOUNT: "" });
    expect(a.adsConfigured()).toBe(false);
    expect(a.adsTxt()).toBeNull();
    expect(a.adsAllowedOnPath("/horoscope/aries")).toBe(false);
    expect(a.slotConfigured("afterReading")).toBe(false);
  });

  it("verification only: the account id gives ads.txt and nothing else", async () => {
    const a = await load({ NEXT_PUBLIC_AD_CLIENT_ID: "", NEXT_PUBLIC_ADSENSE_ACCOUNT: "ca-pub-1234567890123456" });
    expect(a.adsTxt()).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
    expect(a.adsConfigured()).toBe(false);
    expect(a.adsAllowedOnPath("/horoscope/aries")).toBe(false);
  });

  it("fails closed on a malformed id", async () => {
    const a = await load({ NEXT_PUBLIC_AD_CLIENT_ID: "ca-pub-", NEXT_PUBLIC_ADSENSE_ACCOUNT: "me@example.com" });
    expect(a.adsConfigured()).toBe(false);
    expect(a.adsTxt()).toBeNull();
  });

  it("never loads on non-content, private or print pages", async () => {
    const a = await load({ NEXT_PUBLIC_AD_CLIENT_ID: "ca-pub-1234567890123456", NEXT_PUBLIC_AD_SLOT_AFTER_READING: "1234567890" });
    expect(a.adsAllowedOnPath("/horoscope/aries")).toBe(true);
    expect(a.adsAllowedOnPath("/")).toBe(true);
    for (const p of ["/admin", "/admin/readings", "/api/feedback", "/search", "/offline", "/styleguide", "/lucky-days/2026/10/print"]) {
      expect(a.adsAllowedOnPath(p), p).toBe(false);
    }
    expect(a.adsAllowedOnPath("/administrator-tips")).toBe(true); // prefix is a path segment, not a string prefix
    expect(a.slotConfigured("afterReading")).toBe(true);
    expect(a.slotConfigured("rail")).toBe(false);
  });
});
