/**
 * Validation for owner edits to long-form Markdown (admin "Content" tab).
 * An edit replaces the repository file on the site, so it must keep the same
 * shape: required front-matter keys present and typed, and the keys the code
 * reads (slug, animal, relation, outlook) unchanged from the English file.
 */
import matter from "gray-matter";
import { GM_YAML_ONLY, repoSource } from "./content";
import { defineMessages, khmerDigits, type Lang } from "./i18n";

export const MAX_SOURCE_BYTES = 120_000;
const BANNED = [/\bdiagnos/i, /\bmedication\b/i, /\bguarantee/i, /\bdestiny\b/i];

/** Messages for the admin who saved the edit, in the admin page's language (`ui`). */
const T = defineMessages({
  en: {
    tooLong: "That text is too long (120 KB at most).",
    yaml: "The front matter (between the --- lines) is not valid YAML. Check quotes and indentation.",
    body: "The text below the front matter is missing or too short.",
    nameSummary: "name and summary are required.",
    traits: "traits must be a list of words.",
    faq: "Each faq item needs a q and an a.",
    slug: (v: string) => `slug must stay "${v}".`,
    titleSummary: "title and summary are required.",
    months: "months must be a list of { label, text }.",
    keep: (k: string, v: string) => `${k} must stay ${v} (the site reads it).`,
    banned: "That wording breaks the content guidelines (no diagnoses, medication, guarantees or destiny).",
  },
  km: {
    tooLong: `អត្ថបទនេះវែងពេក (យ៉ាងច្រើន ${khmerDigits(120)} KB)។`,
    yaml: "ផ្នែកខាងលើ (ចន្លោះបន្ទាត់ ---) មិនមែនជា YAML ត្រឹមត្រូវទេ។ សូមពិនិត្យសញ្ញាសម្រង់ និងការចូលបន្ទាត់។",
    body: "អត្ថបទខាងក្រោមផ្នែកខាងលើ បាត់ ឬខ្លីពេក។",
    nameSummary: "ត្រូវតែមាន name និង summary។",
    traits: "traits ត្រូវតែជាបញ្ជីពាក្យ។",
    faq: "ធាតុ faq នីមួយៗត្រូវមាន q និង a។",
    slug: (v: string) => `slug ត្រូវតែនៅដដែល "${v}"។`,
    titleSummary: "ត្រូវតែមាន title និង summary។",
    months: "months ត្រូវតែជាបញ្ជី { label, text }។",
    keep: (k: string, v: string) => `${k} ត្រូវតែនៅដដែល ${v} (គេហទំព័រអានវា)។`,
    banned: "ពាក្យពេចន៍នេះខុសគោលការណ៍ណែនាំខ្លឹមសារ (គ្មានការធ្វើរោគវិនិច្ឆ័យ ថ្នាំ ការធានា ឬវាសនា)។",
  },
});

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isStrList = (v: unknown) => Array.isArray(v) && v.every(isStr);
const isFaq = (v: unknown) => v === undefined || (Array.isArray(v) && v.every((f) => f && isStr(f.q) && isStr(f.a)));

/** `lang` is the language of the TEXT; `ui` is the language the message is written in. */
export function validateContent(rel: string, lang: Lang, source: string, ui: Lang = "en"): string | null {
  const t = T[ui];
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) return t.tooLong;
  let data: Record<string, unknown>;
  let body: string;
  try {
    const parsed = matter(source, GM_YAML_ONLY);
    data = parsed.data as Record<string, unknown>;
    body = parsed.content;
  } catch {
    return t.yaml;
  }
  if (body.trim().length < 50) return t.body;
  const english = repoSource(rel, "en");
  const base = english ? (matter(english, GM_YAML_ONLY).data as Record<string, unknown>) : {};

  if (rel.startsWith("profiles/")) {
    if (!isStr(data.name) || !isStr(data.summary)) return t.nameSummary;
    if (!isStrList(data.traits)) return t.traits;
    if (!isFaq(data.faq)) return t.faq;
    if (data.slug !== base.slug) return t.slug(String(base.slug));
  } else {
    if (!isStr(data.title) || !isStr(data.summary)) return t.titleSummary;
    if (!Array.isArray(data.months) || !data.months.every((m) => m && isStr(m.label) && isStr(m.text))) return t.months;
    for (const k of ["animal", "relation", "outlook"] as const) {
      if (data[k] !== base[k]) return t.keep(k, JSON.stringify(base[k]));
    }
  }
  if (lang === "en") {
    const bad = BANNED.find((r) => r.test(source));
    if (bad) return t.banned;
  }
  return null;
}
