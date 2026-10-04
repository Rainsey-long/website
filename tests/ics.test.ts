/** Calendar feeds in both languages: valid folding, distinct UIDs, Khmer titles. */
import { describe, expect, it } from "vitest";
import { feedEvents, toIcs } from "../lib/ics";

describe("calendar feeds", () => {
  it("builds a Khmer edition with its own UIDs and Khmer titles", () => {
    const en = feedEvents("khmer-holy-days", 2026, 2026, "en");
    const km = feedEvents("khmer-holy-days", 2026, 2026, "km");
    expect(km.length).toBe(en.length);
    expect(km[0].uid).toBe(`${en[0].uid}-km`);
    expect(km[0].title).toBe("ថ្ងៃសីល");
    const moon = feedEvents("moon-phases", 2026, 2026, "km");
    expect(moon[0].title).toMatch(/^ព្រះចន្ទ.+ក្នុងរាសី.+/);
    expect(feedEvents("khmer-festivals", 2026, 2026, "km").some((e) => e.title.startsWith("ចូលឆ្នាំខ្មែរ"))).toBe(true);
  });
  it("folds every line at 75 octets", () => {
    const body = toIcs("ពិធីបុណ្យខ្មែរ", feedEvents("khmer-festivals", 2026, 2026, "km"), "km");
    for (const line of body.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(body).toContain("PRODID:-//");
    expect(body).toContain("//KM");
  });
});
