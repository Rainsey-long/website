/**
 * Pythagorean numerology (docs/research/FEATURES.md #26). Pure arithmetic on a
 * birth date and, optionally, a name: no clock, no randomness, no I/O. The
 * page runs it in the visitor's browser, so a birth date never reaches the
 * server (CLAUDE.md owner rule).
 *
 * Method, as set out in Hans Decoz, "Numerology: Key to Your Inner Self"
 * (Perigee, 1994) and repeated by most modern references:
 *
 * - Life path: reduce the month, the day and the year SEPARATELY to a single
 *   digit (keeping 11, 22 and 33 as master numbers), add the three, and reduce
 *   the sum again, keeping master numbers. Reducing each part first is what
 *   lets a master number survive; adding every digit in one string can hide it.
 * - Expression (destiny) number: every letter of the full name takes its
 *   Pythagorean value (A=1 … I=9, J=1 … R=9, S=1 … Z=8), reduced the same way.
 * - Personal year: birth month + birth day + the calendar year, each reduced,
 *   then reduced to 1–9 (personal cycles run 1 to 9, without master numbers).
 * - Personal month: personal year + calendar month, reduced to 1–9.
 * - Birthday number: the day of the month reduced, keeping 11 and 22
 *   (so the 11th, 22nd and 29th keep a master number).
 *
 * The test (tests/numerology.test.ts) pins worked examples done by hand with
 * this method, including the case where a master day survives.
 */

export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

const MASTERS = new Set([11, 22, 33]);

const digitSum = (n: number) => String(Math.abs(Math.trunc(n))).split("").reduce((s, d) => s + Number(d), 0);

/** Reduce to a single digit; with `keepMasters`, stop at 11, 22 or 33. */
export function reduce(n: number, keepMasters = true): number {
  let v = Math.abs(Math.trunc(n));
  while (v > 9 && !(keepMasters && MASTERS.has(v))) v = digitSum(v);
  return v;
}

/** Strict YYYY-MM-DD parse with a real-calendar check; null when invalid. */
export function parseBirthDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (m < 1 || m > 12 || d < 1) return null;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= days ? { y, m, d } : null;
}

export function lifePath(iso: string): NumerologyNumber | null {
  const p = parseBirthDate(iso);
  if (!p) return null;
  return reduce(reduce(p.m) + reduce(p.d) + reduce(p.y)) as NumerologyNumber;
}

export function birthdayNumber(iso: string): NumerologyNumber | null {
  const p = parseBirthDate(iso);
  if (!p) return null;
  const v = reduce(p.d);
  return (v === 33 ? 6 : v) as NumerologyNumber; // no day reaches 33; kept explicit
}

export function personalYear(iso: string, year: number): number | null {
  const p = parseBirthDate(iso);
  if (!p) return null;
  return reduce(reduce(p.m, false) + reduce(p.d, false) + reduce(year, false), false);
}

export function personalMonth(iso: string, year: number, month: number): number | null {
  const py = personalYear(iso, year);
  if (py === null || month < 1 || month > 12) return null;
  return reduce(py + month, false);
}

/** Pythagorean letter value: A, J, S = 1 … I, R = 9. */
export function letterValue(ch: string): number {
  const c = ch.toUpperCase().charCodeAt(0) - 65;
  return c >= 0 && c < 26 ? (c % 9) + 1 : 0;
}

/**
 * Expression number from the Latin letters of a name. Accents are folded
 * (é → e); any other character is ignored. Null when there are no Latin letters.
 */
export function expressionNumber(name: string): NumerologyNumber | null {
  const letters = name.normalize("NFD").replace(/[^A-Za-z]/g, "");
  if (!letters) return null;
  // Reduce each word first (Decoz), so a master number inside a word survives.
  const words = name.normalize("NFD").split(/\s+/).map((w) => w.replace(/[^A-Za-z]/g, "")).filter(Boolean);
  const total = words.reduce((s, w) => s + reduce([...w].reduce((a, ch) => a + letterValue(ch), 0)), 0);
  return reduce(total) as NumerologyNumber;
}

export interface NumerologyResult {
  lifePath: NumerologyNumber;
  birthday: NumerologyNumber;
  personalYear: number;
  personalMonth: number;
  expression: NumerologyNumber | null;
}

/** Everything the page shows; `today` is the visitor's local YYYY-MM-DD. */
export function numerology(birth: string, today: string, name = ""): NumerologyResult | null {
  const t = parseBirthDate(today);
  const lp = lifePath(birth);
  const bd = birthdayNumber(birth);
  if (!t || lp === null || bd === null) return null;
  return {
    lifePath: lp,
    birthday: bd,
    personalYear: personalYear(birth, t.y)!,
    personalMonth: personalMonth(birth, t.y, t.m)!,
    expression: expressionNumber(name),
  };
}
