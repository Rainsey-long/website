/**
 * Validation for owner edits to long-form Markdown (admin "Content" tab).
 * An edit replaces the repository file on the site, so it must keep the same
 * shape: required front-matter keys present and typed, and the keys the code
 * reads (slug, animal, relation, outlook) unchanged from the English file.
 */
import matter from "gray-matter";
import { GM_YAML_ONLY, repoSource } from "./content";
import type { Lang } from "./i18n";

export const MAX_SOURCE_BYTES = 120_000;
const BANNED = [/\bdiagnos/i, /\bmedication\b/i, /\bguarantee/i, /\bdestiny\b/i];

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isStrList = (v: unknown) => Array.isArray(v) && v.every(isStr);
const isFaq = (v: unknown) => v === undefined || (Array.isArray(v) && v.every((f) => f && isStr(f.q) && isStr(f.a)));

export function validateContent(rel: string, lang: Lang, source: string): string | null {
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) return "That text is too long (120 KB at most).";
  let data: Record<string, unknown>;
  let body: string;
  try {
    const parsed = matter(source, GM_YAML_ONLY);
    data = parsed.data as Record<string, unknown>;
    body = parsed.content;
  } catch {
    return "The front matter (between the --- lines) is not valid YAML. Check quotes and indentation.";
  }
  if (body.trim().length < 50) return "The text below the front matter is missing or too short.";
  const english = repoSource(rel, "en");
  const base = english ? (matter(english, GM_YAML_ONLY).data as Record<string, unknown>) : {};

  if (rel.startsWith("profiles/")) {
    if (!isStr(data.name) || !isStr(data.summary)) return "name and summary are required.";
    if (!isStrList(data.traits)) return "traits must be a list of words.";
    if (!isFaq(data.faq)) return "Each faq item needs a q and an a.";
    if (data.slug !== base.slug) return `slug must stay "${String(base.slug)}".`;
  } else {
    if (!isStr(data.title) || !isStr(data.summary)) return "title and summary are required.";
    if (!Array.isArray(data.months) || !data.months.every((m) => m && isStr(m.label) && isStr(m.text))) return "months must be a list of { label, text }.";
    for (const k of ["animal", "relation", "outlook"] as const) {
      if (data[k] !== base[k]) return `${k} must stay ${JSON.stringify(base[k])} (the site reads it).`;
    }
  }
  if (lang === "en") {
    const bad = BANNED.find((r) => r.test(source));
    if (bad) return "That wording breaks the content guidelines (no diagnoses, medication, guarantees or destiny).";
  }
  return null;
}
