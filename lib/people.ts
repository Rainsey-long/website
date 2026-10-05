/**
 * Saved people (docs/research/FEATURES.md #8). A visitor can keep up to six
 * people (themselves, family, friends) with a birth date and, optionally, a
 * time and a city, so the birth forms can be filled with one tap.
 *
 * Stored ONLY in the visitor's browser (localStorage key `people`): no account,
 * no cookie, no request carries it (CLAUDE.md owner rule). This module is pure
 * (no "use client", no storage access): parsing, validation and list edits.
 * The storage itself is in components/client/PeoplePicker.tsx.
 *
 * Anything read back from storage is treated as untrusted: a wrong version,
 * corrupt JSON or a malformed entry is dropped, never thrown.
 */

export const PEOPLE_KEY = "people";
export const PEOPLE_VERSION = 1;
export const MAX_PEOPLE = 6;
export const MAX_LABEL = 24;

export interface Person {
  /** What the visitor calls them: "Me", "Mum". Unique, compared without case. */
  label: string;
  /** YYYY-MM-DD, 1900-01-01 or later. */
  date: string;
  /** HH:MM, 24-hour; absent when unknown. */
  time?: string;
  /** A city slug from lib/cities.ts (citySlug); absent when not given. */
  city?: string;
}

/** Same slug rule as lib/cities.ts (which uses this function). */
export function citySlug(name: string, country: string): string {
  return `${name}-${country}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function cleanLabel(s: string): string {
  // Control characters out, whitespace collapsed, length capped.
  return s.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);
}

function validDate(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || mo < 1 || mo > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

/** A valid Person from untrusted input, or null. Optional fields that fail are dropped. */
export function validatePerson(v: unknown): Person | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const label = typeof o.label === "string" ? cleanLabel(o.label) : "";
  if (!label || !validDate(o.date)) return null;
  const p: Person = { label, date: o.date };
  if (typeof o.time === "string" && TIME_RE.test(o.time)) p.time = o.time;
  if (typeof o.city === "string" && o.city.length <= 80 && SLUG_RE.test(o.city)) p.city = o.city;
  return p;
}

const sameLabel = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();

/** Parse the stored value; anything unexpected gives an empty list. */
export function parsePeople(raw: string | null): Person[] {
  if (!raw) return [];
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return []; }
  if (!data || typeof data !== "object" || (data as { v?: unknown }).v !== PEOPLE_VERSION) return [];
  const list = (data as { people?: unknown }).people;
  if (!Array.isArray(list)) return [];
  const out: Person[] = [];
  for (const item of list) {
    const p = validatePerson(item);
    if (p && !out.some((q) => sameLabel(q.label, p.label))) out.push(p);
    if (out.length === MAX_PEOPLE) break;
  }
  return out;
}

export function serializePeople(people: Person[]): string {
  return JSON.stringify({ v: PEOPLE_VERSION, people: people.slice(0, MAX_PEOPLE) });
}

export type SaveResult = { ok: true; people: Person[] } | { ok: false; reason: "invalid" | "full" };

/** Add a person, or replace the one with the same label. Refuses a seventh. */
export function savePerson(people: Person[], input: unknown): SaveResult {
  const p = validatePerson(input);
  if (!p) return { ok: false, reason: "invalid" };
  const i = people.findIndex((q) => sameLabel(q.label, p.label));
  if (i >= 0) return { ok: true, people: people.map((q, j) => (j === i ? p : q)) };
  if (people.length >= MAX_PEOPLE) return { ok: false, reason: "full" };
  return { ok: true, people: [...people, p] };
}

export function forgetPerson(people: Person[], label: string): Person[] {
  return people.filter((q) => !sameLabel(q.label, label));
}

type NamedCity = { name: string; country: string };

/** The slug of the city a form's typed text names ("Phnom Penh, Cambodia" or "Phnom Penh"), if any. */
export function slugForCityText(cities: NamedCity[], text: string): string | undefined {
  const t = text.trim().toLowerCase();
  if (!t) return undefined;
  const c = cities.find((x) => `${x.name}, ${x.country}`.toLowerCase() === t || x.name.toLowerCase() === t);
  return c ? citySlug(c.name, c.country) : undefined;
}

/** The text a form's city field shows for a saved slug ("" when unknown). */
export function cityTextForSlug(cities: NamedCity[], slug: string | undefined): string {
  const c = slug ? cities.find((x) => citySlug(x.name, x.country) === slug) : undefined;
  return c ? `${c.name}, ${c.country}` : "";
}
