import { describe, expect, it } from "vitest";
import { birthdayNumber, expressionNumber, letterValue, lifePath, numerology, personalMonth, personalYear, reduce } from "@/lib/numerology";

// Worked examples done by hand with the reduction method in Hans Decoz,
// "Numerology: Key to Your Inner Self" (1994): reduce month, day and year
// separately (keeping 11/22/33), add, reduce again.
describe("numerology", () => {
  it("reduces with and without master numbers", () => {
    expect(reduce(1985)).toBe(5); // 23 → 5
    expect(reduce(29)).toBe(11);
    expect(reduce(29, false)).toBe(2);
    expect(reduce(22)).toBe(22);
    expect(reduce(33)).toBe(33);
    expect(reduce(44)).toBe(8);
  });

  it("life path: 29 December 1985 → 3 + 11 + 5 = 19 → 1", () => {
    expect(lifePath("1985-12-29")).toBe(1);
  });
  it("life path keeps a master sum: 18 November 1971 → 11 + 9 + 9 = 29 → 11", () => {
    expect(lifePath("1971-11-18")).toBe(11);
  });
  it("life path 22: 9 April 1980 → 4 + 9 + 9", () => {
    expect(lifePath("1980-04-09")).toBe(22);
  });
  it("rejects impossible dates", () => {
    expect(lifePath("2023-02-29")).toBeNull();
    expect(lifePath("1990-13-01")).toBeNull();
    expect(lifePath("nope")).toBeNull();
  });

  it("birthday number keeps 11 and 22", () => {
    expect(birthdayNumber("1985-12-29")).toBe(11);
    expect(birthdayNumber("1985-12-22")).toBe(22);
    expect(birthdayNumber("1985-12-31")).toBe(4);
  });

  it("personal year and month: born 29 December, in October 2026", () => {
    // 12 → 3, 29 → 2, 2026 → 10 → 1; 3 + 2 + 1 = 6. October: 6 + 10 = 16 → 7.
    expect(personalYear("1985-12-29", 2026)).toBe(6);
    expect(personalMonth("1985-12-29", 2026, 10)).toBe(7);
  });

  it("uses the Pythagorean letter table", () => {
    expect([..."AIJRSZ"].map(letterValue)).toEqual([1, 9, 1, 9, 1, 8]);
    // JOHN 1+6+8+5 = 20 → 2; SMITH 1+4+9+2+8 = 24 → 6; 2 + 6 = 8.
    expect(expressionNumber("John Smith")).toBe(8);
    expect(expressionNumber("José")).toBe(4); // accent folded: 1+6+1+5 = 13
    expect(expressionNumber("សុខា")).toBeNull();
  });

  it("puts it together from the visitor's local date", () => {
    expect(numerology("1985-12-29", "2026-10-05", "John Smith")).toEqual({ lifePath: 1, birthday: 11, personalYear: 6, personalMonth: 7, expression: 8 });
    expect(numerology("1985-12-29", "2026-10-05")?.expression).toBeNull();
  });
});
