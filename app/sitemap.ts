/**
 * Sitemap (plan §9). Dynamic, not prerendered: a build-time sitemap would
 * describe the build's clock and database (CamboMath environment.md #3).
 */
import type { MetadataRoute } from "next";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import { WEEKDAYS } from "@/lib/khmer";
import { pairSlug } from "@/lib/compatibility";
import { dailyWindow } from "@/lib/pages";
import { dateInZone } from "@/lib/today";
import { DEFAULT_TZ, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly", priority = 0.5) => ({ url: `${SITE_URL}${p}`, changeFrequency, priority });
  const today = dateInZone(DEFAULT_TZ);
  const y = Number(today.slice(0, 4));
  const out: MetadataRoute.Sitemap = [
    u("", "daily", 1), u("/horoscope", "daily", 0.9), u("/zodiac"), u("/chinese-zodiac"), u("/chinese-zodiac/2027", "monthly", 0.8),
    u("/compatibility"), u("/chinese-compatibility"), u("/tools/zodiac-calculator", "monthly", 0.8), u("/tools/compatibility-checker"),
    u("/khmer", "daily", 0.8), u("/khmer/new-year", "weekly", 0.8), u("/sky", "daily", 0.7), u("/feeds"),
    u("/southeast-asian-zodiac"), u("/southeast-asian-zodiac/khmer"), u("/southeast-asian-zodiac/vietnamese"),
    u("/about", "yearly", 0.3), u("/contact", "yearly", 0.3), u("/privacy", "yearly", 0.2), u("/terms", "yearly", 0.2), u("/disclaimer", "yearly", 0.2),
  ];
  for (const s of SIGNS) {
    out.push(u(`/horoscope/${s.slug}`, "daily", 0.9), u(`/zodiac/${s.slug}`, "monthly", 0.7));
    for (const d of dailyWindow(today)) out.push(u(`/horoscope/${s.slug}/${d}`, "never", 0.4));
  }
  for (const a of ANIMALS) out.push(u(`/chinese-zodiac/${a.slug}`, "weekly", 0.7), u(`/chinese-zodiac/${a.slug}/2027`, "monthly", 0.8));
  for (const w of WEEKDAYS) out.push(u(`/khmer/born-on/${w.en.toLowerCase()}`, "yearly", 0.6));
  for (const list of [SIGNS, ANIMALS] as const) {
    const base = list === SIGNS ? "/compatibility/" : "/chinese-compatibility/";
    for (const a of list) for (const b of list) if (a.slug <= b.slug) out.push(u(`${base}${pairSlug(a.slug, b.slug)}`, "yearly", 0.6));
  }
  for (const year of [y, y + 1]) {
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, "0");
      out.push(u(`/lucky-days/${year}/${mm}`, "monthly", 0.6), u(`/sky/moon/${year}/${mm}`, "monthly", 0.5));
    }
    out.push(u(`/sky/retrogrades/${year}`, "monthly", 0.6));
  }
  return out;
}
