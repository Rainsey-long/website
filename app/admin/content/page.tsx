/**
 * Admin: long-form pages (Western and Chinese profiles, 2027 forecasts).
 * For each page and language: where the text comes from (the repository file
 * or an edit saved here) and whether a Khmer version exists.
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CONTENT_PATHS, repoSource } from "@/lib/content";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import { animalName, signName } from "@/lib/names";
import { longDate } from "@/lib/dates";
import { defineMessages, localePath, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Profiles and forecasts",
    lead: "Edit any page in English or Khmer. Your edit replaces the original on the site straight away and survives every deploy; \"Reset\" on the edit page goes back to the original file.",
    groups: { western: "Western sign profiles", chinese: "Chinese animal profiles", yearly: "2027 Fire Goat forecasts" },
    page: "Page",
    english: "English",
    khmer: "Khmer",
    edit: "Edit",
    edited: (date: string, by: string | null) => `Edited ${date}${by ? ` by ${by}` : ""}`,
    originalFile: "Original file",
    noKm: "No Khmer yet (English shown)",
    missing: "Missing",
  },
  km: {
    title: "ប្រវត្តិរូប និងការព្យាករណ៍",
    lead: "កែទំព័រណាមួយជាភាសាអង់គ្លេស ឬខ្មែរ។ ការកែរបស់អ្នកជំនួសអត្ថបទដើមនៅលើគេហទំព័រភ្លាមៗ ហើយនៅដដែលក្រោយការដាក់ឱ្យដំណើរការម្ដងៗ។ ប៊ូតុង \"ត្រឡប់ទៅឯកសារដើម\" នៅលើទំព័រកែ នាំទៅឯកសារដើមវិញ។",
    groups: { western: "ប្រវត្តិរូបរាសីលោកខាងលិច", chinese: "ប្រវត្តិរូបសត្វឆ្នាំចិន", yearly: "ការព្យាករណ៍ឆ្នាំមមែភ្លើង ២០២៧" },
    page: "ទំព័រ",
    english: "ភាសាអង់គ្លេស",
    khmer: "ភាសាខ្មែរ",
    edit: "កែ",
    edited: (date: string, by: string | null) => `បានកែ ${date}${by ? ` ដោយ ${by}` : ""}`,
    originalFile: "ឯកសារដើម",
    noKm: "មិនទាន់មានភាសាខ្មែរ (បង្ហាញភាសាអង់គ្លេស)",
    missing: "បាត់",
  },
});

const GROUPS: Array<{ key: "western" | "chinese" | "yearly"; prefix: string; public: (slug: string) => string }> = [
  { key: "western", prefix: "profiles/western/", public: (s) => `/zodiac/${s}` },
  { key: "chinese", prefix: "profiles/chinese/", public: (s) => `/chinese-zodiac/${s}` },
  { key: "yearly", prefix: "yearly/2027/", public: (s) => `/chinese-zodiac/${s}/2027` },
];

function nameOf(slug: string, lang: Lang): string {
  if (SIGNS.some((s) => s.slug === slug)) return lang === "km" ? signName(slug, "km") : SIGNS.find((s) => s.slug === slug)!.name;
  if (ANIMALS.some((a) => a.slug === slug)) return lang === "km" ? animalName(slug, "km") : ANIMALS.find((a) => a.slug === slug)!.name;
  return slug;
}

export default async function ContentAdmin() {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  const rows = getDb().prepare("SELECT path, lang, updated_at, updated_by FROM content_overrides").all() as Array<{ path: string; lang: Lang; updated_at: string; updated_by: string | null }>;
  const edited = new Map(rows.map((r) => [`${r.lang}:${r.path}`, r]));
  const state = (path: string, textLang: Lang) => {
    const e = edited.get(`${textLang}:${path}`);
    if (e) return { label: t.edited(lang === "km" ? longDate(e.updated_at.slice(0, 10), "km") : e.updated_at.slice(0, 10), e.updated_by), strong: true };
    if (repoSource(path, textLang)) return { label: t.originalFile, strong: false };
    return { label: textLang === "km" ? t.noKm : t.missing, strong: true };
  };
  return (
    <section>
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 max-w-reading text-small text-muted">{t.lead}</p>
      {GROUPS.map((g) => (
        <div key={g.prefix} className="mt-7">
          <h2 className="text-h2">{t.groups[g.key]}</h2>
          <table className="mt-3 w-full text-left text-small">
            <thead><tr className="border-b border-rule text-muted"><th className="py-2 font-normal">{t.page}</th><th className="py-2 font-normal">{t.english}</th><th className="py-2 font-normal">{t.khmer}</th></tr></thead>
            <tbody>
              {CONTENT_PATHS.filter((p) => p.startsWith(g.prefix)).map((p) => {
                const slug = p.slice(g.prefix.length, -3);
                return (
                  <tr key={p} className="border-b border-rule align-top">
                    <td className="py-3 pr-3"><Link className="link" href={g.public(slug)} target="_blank">{nameOf(slug, lang)}</Link></td>
                    {(["en", "km"] as const).map((textLang) => {
                      const st = state(p, textLang);
                      return (
                        <td key={textLang} className="py-3 pr-3">
                          <Link className="link inline-flex min-h-tap items-center" href={`/admin/content/edit?path=${encodeURIComponent(p)}&lang=${textLang}`}>{t.edit}</Link>
                          <span className={`block ${st.strong ? "font-semibold" : "text-muted"}`}>{st.label}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
