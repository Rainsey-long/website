/**
 * Admin: long-form pages (Western and Chinese profiles, 2027 forecasts).
 * For each page: where the text comes from (the repository file or an edit
 * saved here). The site is English only, so only English text is edited.
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CONTENT_PATHS, repoSource } from "@/lib/content";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Profiles and forecasts",
    lead: "Edit any page. Your edit replaces the original on the site straight away and survives every deploy; \"Reset\" on the edit page goes back to the original file.",
    groups: { western: "Western sign profiles", chinese: "Chinese animal profiles", yearly: "2027 Fire Goat forecasts" },
    page: "Page",
    source: "Text",
    edit: "Edit",
    edited: (date: string, by: string | null) => `Edited ${date}${by ? ` by ${by}` : ""}`,
    originalFile: "Original file",
    missing: "Missing",
  },
});

const GROUPS: Array<{ key: "western" | "chinese" | "yearly"; prefix: string; public: (slug: string) => string }> = [
  { key: "western", prefix: "profiles/western/", public: (s) => `/zodiac/${s}` },
  { key: "chinese", prefix: "profiles/chinese/", public: (s) => `/chinese-zodiac/${s}` },
  { key: "yearly", prefix: "yearly/2027/", public: (s) => `/chinese-zodiac/${s}/2027` },
];

function nameOf(slug: string): string {
  if (SIGNS.some((s) => s.slug === slug)) return SIGNS.find((s) => s.slug === slug)!.name;
  if (ANIMALS.some((a) => a.slug === slug)) return ANIMALS.find((a) => a.slug === slug)!.name;
  return slug;
}

export default async function ContentAdmin() {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  const rows = getDb().prepare("SELECT path, updated_at, updated_by FROM content_overrides WHERE lang = 'en'").all() as Array<{ path: string; updated_at: string; updated_by: string | null }>;
  const edited = new Map(rows.map((r) => [r.path, r]));
  const state = (path: string) => {
    const e = edited.get(path);
    if (e) return { label: t.edited(e.updated_at.slice(0, 10), e.updated_by), strong: true };
    if (repoSource(path, "en")) return { label: t.originalFile, strong: false };
    return { label: t.missing, strong: true };
  };
  return (
    <section>
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 max-w-reading text-small text-muted">{t.lead}</p>
      {GROUPS.map((g) => (
        <div key={g.prefix} className="mt-7">
          <h2 className="text-h2">{t.groups[g.key]}</h2>
          <table className="mt-3 w-full text-left text-small">
            <thead><tr className="border-b border-rule text-muted"><th className="py-2 font-normal">{t.page}</th><th className="py-2 font-normal">{t.source}</th></tr></thead>
            <tbody>
              {CONTENT_PATHS.filter((p) => p.startsWith(g.prefix)).map((p) => {
                const slug = p.slice(g.prefix.length, -3);
                const st = state(p);
                return (
                  <tr key={p} className="border-b border-rule align-top">
                    <td className="py-3 pr-3"><Link className="link" href={g.public(slug)} target="_blank">{nameOf(slug)}</Link></td>
                    <td className="py-3 pr-3">
                      <Link className="link inline-flex min-h-tap items-center" href={`/admin/content/edit?path=${encodeURIComponent(p)}`}>{t.edit}</Link>
                      <span className={`block ${st.strong ? "font-semibold" : "text-muted"}`}>{st.label}</span>
                    </td>
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
