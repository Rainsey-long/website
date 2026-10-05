/**
 * iCalendar feeds (RFC 5545) for subscribable calendars. Stable UIDs so a
 * calendar app updates events rather than duplicating them. No personal data.
 */
import { DOMAIN, SITE_NAME } from "./site";
import { eclipseName, eclipsesForYear, moonPhases, phaseName, planetNameIn, retrogradesForYear, signNameIn } from "./skyEvents";
import { khmerDigits, type Lang } from "./i18n";
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

export function toIcs(name: string, events: IcsEvent[], lang: Lang = "en"): string {
  const now = stamp(new Date().toISOString().slice(0, 19) + "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${SITE_NAME}//${DOMAIN}//${lang.toUpperCase()}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(name)}`, "REFRESH-INTERVAL;VALUE=DURATION:P1D"];
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

/** Feed names in both languages; `?lang=km` serves the Khmer edition of each file. */
export const FEEDS = {
  "moon-phases": { title: "Moon phases", about: "New moons, first quarters, full moons and last quarters, with the Moon's sign.", titleKm: "ដំណាក់កាលព្រះចន្ទ", aboutKm: "ព្រះចន្ទងងឹត ព្រះចន្ទកន្លះដើមខែ ព្រះចន្ទពេញវង់ និងព្រះចន្ទកន្លះចុងខែ ព្រមទាំងរាសីដែលព្រះចន្ទស្ថិតនៅ។" },
  retrogrades: { title: "Retrogrades", about: "Each planet's retrograde period from Mercury to Saturn, as an all-day span.", titleKm: "ភពដើរថយក្រោយ", aboutKm: "រយៈពេលដែលភពនីមួយៗដើរថយក្រោយ ចាប់ពីព្រះពុធដល់ព្រះសៅរ៍ ជាព្រឹត្តិការណ៍ពេញមួយថ្ងៃ។" },
  eclipses: { title: "Eclipses", about: "Solar and lunar eclipses at their peak moment.", titleKm: "សូរ្យគ្រាស និងចន្ទគ្រាស", aboutKm: "សូរ្យគ្រាស និងចន្ទគ្រាស នៅពេលដែលវាពេញលេញបំផុត។" },
  "khmer-holy-days": { title: "Khmer Buddhist holy days", about: "Every ថ្ងៃសីល: the 8th and 15th of the waxing and waning Moon.", titleKm: "ថ្ងៃសីលព្រះពុទ្ធសាសនា", aboutKm: "រាល់ថ្ងៃសីល៖ ថ្ងៃ ៨ និង ១៥ កើត និងរោច។" },
  "khmer-festivals": { title: "Khmer festivals", about: "Khmer New Year, Visak Bochea, Pchum Ben, the Water Festival and other lunar festivals.", titleKm: "ពិធីបុណ្យខ្មែរ", aboutKm: "ចូលឆ្នាំខ្មែរ វិសាខបូជា ភ្ជុំបិណ្ឌ បុណ្យអុំទូក និងពិធីបុណ្យតាមចន្ទគតិផ្សេងទៀត។" },
} as const;
export type FeedName = keyof typeof FEEDS;

/**
 * Events for one feed, in English or Khmer. A Khmer edition has its own UIDs
 * (suffix "-km") so someone subscribed to both languages does not see one
 * overwrite the other.
 *
 * `eve` (holy-day feed only, `?eve=1`) adds an all-day note the day before
 * each ថ្ងៃសីល, so people who keep the precepts can prepare. Eve UIDs are the
 * holy day's UID with "-eve" before the language suffix; the holy days'
 * own UIDs never change.
 */
export function feedEvents(name: FeedName, fromYear: number, toYear: number, lang: Lang = "en", opts: { eve?: boolean } = {}): IcsEvent[] {
  const km = lang === "km";
  const sfx = km ? "-km" : "";
  const sign = (i: number) => signNameIn(i, lang);
  const out: IcsEvent[] = [];
  const from = `${fromYear}-01-01`, to = `${toYear + 1}-01-01`;
  if (name === "moon-phases") {
    for (const p of moonPhases(`${from}T00:00:00Z`, `${to}T00:00:00Z`)) {
      out.push({ uid: `moon-${stamp(p.at.slice(0, 16) + ":00Z")}${sfx}`, title: km ? `${phaseName(p, "km")} ក្នុងរាសី${sign(p.signIndex)}` : `${p.name} in ${sign(p.signIndex)}`, start: p.at });
    }
  } else if (name === "retrogrades") {
    for (let y = fromYear; y <= toYear; y++) for (const r of retrogradesForYear(y)) {
      const planet = planetNameIn(r.planet, lang);
      out.push({
        uid: `rx-${r.planet}-${r.stationRx.at.slice(0, 10)}${sfx}`, allDay: true, start: r.stationRx.at.slice(0, 10), end: addDays(r.stationD.at.slice(0, 10), 1),
        title: km ? `${planet}ដើរថយក្រោយ` : `${r.name} retrograde`,
        description: km ? `ចាប់ផ្ដើមដើរថយក្រោយក្នុងរាសី${sign(r.stationRx.signIndex)} ហើយដើរទៅមុខវិញក្នុងរាសី${sign(r.stationD.signIndex)}។` : `Turns retrograde in ${sign(r.stationRx.signIndex)}, turns direct in ${sign(r.stationD.signIndex)}.`,
      });
    }
  } else if (name === "eclipses") {
    for (let y = fromYear; y <= toYear; y++) for (const e of eclipsesForYear(y)) {
      out.push({ uid: `eclipse-${e.body}-${e.at.slice(0, 10)}${sfx}`, title: eclipseName(e, lang), start: e.at });
    }
  } else {
    for (let d = from; d < to; d = addDays(d, 1)) {
      const k = khmerDay(d);
      if (name === "khmer-holy-days" && k.sila) {
        if (opts.eve) out.push({ uid: `sila-${d}-eve${sfx}`, title: km ? "ថ្ងៃមុនថ្ងៃសីល" : "Eve of a Buddhist holy day (ថ្ងៃសីល)", allDay: true, start: addDays(d, -1), description: km ? `ថ្ងៃស្អែកជាថ្ងៃសីល ${k.labelKmShort}។` : `Tomorrow is a Buddhist holy day, the ${k.labelEn}. ${k.labelKmShort}` });
        out.push({ uid: `sila-${d}${sfx}`, title: km ? "ថ្ងៃសីល" : "Buddhist holy day (ថ្ងៃសីល)", allDay: true, start: d, description: km ? k.labelKm : `${k.labelEn}. ${k.labelKm}` });
      }
      if (name === "khmer-festivals" && k.festival && k.festival.id !== "khmer-new-year") out.push({ uid: `kh-${k.festival.id}-${d}${sfx}`, title: km ? k.festival.km : `${k.festival.en} (${k.festival.km})`, allDay: true, start: d });
    }
    if (name === "khmer-festivals") for (let y = fromYear; y <= toYear; y++) {
      const s = songkran(y);
      out.push({
        uid: `kh-new-year-${y}${sfx}`, allDay: true, start: s.days[0].date, end: addDays(s.days[s.days.length - 1].date, 1),
        title: km ? `ចូលឆ្នាំខ្មែរ៖ ${s.angel.km} យាងមក` : `Khmer New Year: ${s.angel.roman} arrives`,
        description: km ? `មហាសង្ក្រាន្ត ${khmerDigits(s.date)} ម៉ោង ${khmerDigits(s.time)} (ម៉ោងកម្ពុជា)។` : `Moha Songkran ${s.date} ${s.time} (UTC+7).`,
      });
    }
  }
  return out;
}
