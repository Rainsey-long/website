/**
 * iCalendar feeds (RFC 5545) for subscribable calendars. Stable UIDs so a
 * calendar app updates events rather than duplicating them. No personal data.
 */
import { DOMAIN, SITE_NAME } from "./site";
import { eclipsesForYear, moonPhases, retrogradesForYear, signName } from "./skyEvents";
import { khmerDay, songkran } from "./khmer";
import { addDays } from "./dates";

export interface IcsEvent { uid: string; title: string; description?: string; start: string; allDay?: boolean; end?: string }

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const day = (d: string) => d.replace(/-/g, "");

/**
 * Fold lines at 75 octets as RFC 5545 §3.1 requires. Counted in UTF-8 bytes,
 * not characters: a Khmer character is 3 octets, so a character count let
 * Khmer lines reach 113 octets. Never splits a code point; a continuation line
 * starts with one space, so it carries at most 74 octets of content.
 */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "", bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > (out.length === 0 ? 75 : 74)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function toIcs(name: string, events: IcsEvent[]): string {
  const now = stamp(new Date().toISOString().slice(0, 19) + "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${SITE_NAME}//${DOMAIN}//EN`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(name)}`, "REFRESH-INTERVAL;VALUE=DURATION:P1D"];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@${DOMAIN}`, `DTSTAMP:${now}`);
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${day(e.start)}`, `DTEND;VALUE=DATE:${day(e.end ?? addDays(e.start, 1))}`);
    } else {
      lines.push(`DTSTART:${stamp(e.start.slice(0, 19) + "Z")}`, `DTEND:${stamp(e.start.slice(0, 19) + "Z")}`);
    }
    lines.push(`SUMMARY:${esc(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export const FEEDS = {
  "moon-phases": { title: "Moon phases", about: "New moons, first quarters, full moons and last quarters, with the Moon's sign." },
  retrogrades: { title: "Retrogrades", about: "Each planet's retrograde period from Mercury to Saturn, as an all-day span." },
  eclipses: { title: "Eclipses", about: "Solar and lunar eclipses at their peak moment." },
  "khmer-holy-days": { title: "Khmer Buddhist holy days", about: "Every ថ្ងៃសីល: the 8th and 15th of the waxing and waning Moon." },
  "khmer-festivals": { title: "Khmer festivals", about: "Khmer New Year, Visak Bochea, Pchum Ben, the Water Festival and other lunar festivals." },
} as const;
export type FeedName = keyof typeof FEEDS;

export function feedEvents(name: FeedName, fromYear: number, toYear: number): IcsEvent[] {
  const out: IcsEvent[] = [];
  const from = `${fromYear}-01-01`, to = `${toYear + 1}-01-01`;
  if (name === "moon-phases") {
    for (const p of moonPhases(`${from}T00:00:00Z`, `${to}T00:00:00Z`)) {
      out.push({ uid: `moon-${stamp(p.at.slice(0, 16) + ":00Z")}`, title: `${p.name} in ${signName(p.signIndex)}`, start: p.at });
    }
  } else if (name === "retrogrades") {
    for (let y = fromYear; y <= toYear; y++) for (const r of retrogradesForYear(y)) {
      out.push({ uid: `rx-${r.planet}-${r.stationRx.at.slice(0, 10)}`, title: `${r.name} retrograde`, allDay: true, start: r.stationRx.at.slice(0, 10), end: addDays(r.stationD.at.slice(0, 10), 1), description: `Turns retrograde in ${signName(r.stationRx.signIndex)}, turns direct in ${signName(r.stationD.signIndex)}.` });
    }
  } else if (name === "eclipses") {
    for (let y = fromYear; y <= toYear; y++) for (const e of eclipsesForYear(y)) {
      out.push({ uid: `eclipse-${e.body}-${e.at.slice(0, 10)}`, title: `${e.kind[0].toUpperCase() + e.kind.slice(1)} ${e.body === "sun" ? "solar" : "lunar"} eclipse`, start: e.at });
    }
  } else {
    for (let d = from; d < to; d = addDays(d, 1)) {
      const k = khmerDay(d);
      if (name === "khmer-holy-days" && k.sila) out.push({ uid: `sila-${d}`, title: "Buddhist holy day (ថ្ងៃសីល)", allDay: true, start: d, description: `${k.labelEn}. ${k.labelKm}` });
      if (name === "khmer-festivals" && k.festival && k.festival.id !== "khmer-new-year") out.push({ uid: `kh-${k.festival.id}-${d}`, title: `${k.festival.en} (${k.festival.km})`, allDay: true, start: d });
    }
    if (name === "khmer-festivals") for (let y = fromYear; y <= toYear; y++) {
      const s = songkran(y);
      out.push({ uid: `kh-new-year-${y}`, title: `Khmer New Year: ${s.angel.roman} arrives`, allDay: true, start: s.days[0].date, end: addDays(s.days[s.days.length - 1].date, 1), description: `Moha Songkran ${s.date} ${s.time} (UTC+7).` });
    }
  }
  return out;
}
