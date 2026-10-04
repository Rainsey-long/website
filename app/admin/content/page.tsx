/**
 * Admin: long-form pages (Western and Chinese profiles, 2027 forecasts).
 * For each page and language: where the text comes from (the repository file
 * or an edit saved here) and whether a Khmer version exists.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { CONTENT_PATHS, repoSource } from "@/lib/content";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const GROUPS: Array<{ title: string; prefix: string; public: (slug: string) => string }> = [
  { title: "Western sign profiles", prefix: "profiles/western/", public: (s) => `/zodiac/${s}` },
  { title: "Chinese animal profiles", prefix: "profiles/chinese/", public: (s) => `/chinese-zodiac/${s}` },
  { title: "2027 Fire Goat forecasts", prefix: "yearly/2027/", public: (s) => `/chinese-zodiac/${s}/2027` },
];

const nameOf = (slug: string) => SIGNS.find((s) => s.slug === slug)?.name ?? ANIMALS.find((a) => a.slug === slug)?.name ?? slug;

export default async function ContentAdmin() {
  if (!(await getSession())) redirect("/admin/login");
  const rows = getDb().prepare("SELECT path, lang, updated_at, updated_by FROM content_overrides").all() as Array<{ path: string; lang: Lang; updated_at: string; updated_by: string | null }>;
  const edited = new Map(rows.map((r) => [`${r.lang}:${r.path}`, r]));
  const state = (path: string, lang: Lang) => {
    const e = edited.get(`${lang}:${path}`);
    if (e) return { label: `Edited ${e.updated_at.slice(0, 10)}${e.updated_by ? ` by ${e.updated_by}` : ""}`, strong: true };
    if (repoSource(path, lang)) return { label: "Original file", strong: false };
    return { label: lang === "km" ? "No Khmer yet (English shown)" : "Missing", strong: true };
  };
  return (
    <section>
      <h1 className="text-h1">Profiles and forecasts</h1>
      <p className="mt-2 max-w-reading text-small text-muted">Edit any page in English or Khmer. Your edit replaces the original on the site straight away and survives every deploy; &quot;Reset&quot; on the edit page goes back to the original file.</p>
      {GROUPS.map((g) => (
        <div key={g.prefix} className="mt-7">
          <h2 className="text-h2">{g.title}</h2>
          <table className="mt-3 w-full text-left text-small">
            <thead><tr className="border-b border-rule text-muted"><th className="py-2 font-normal">Page</th><th className="py-2 font-normal">English</th><th className="py-2 font-normal">Khmer</th></tr></thead>
            <tbody>
              {CONTENT_PATHS.filter((p) => p.startsWith(g.prefix)).map((p) => {
                const slug = p.slice(g.prefix.length, -3);
                return (
                  <tr key={p} className="border-b border-rule align-top">
                    <td className="py-3 pr-3"><Link className="link" href={g.public(slug)} target="_blank">{nameOf(slug)}</Link></td>
                    {(["en", "km"] as const).map((lang) => {
                      const st = state(p, lang);
                      return (
                        <td key={lang} className="py-3 pr-3">
                          <Link className="link inline-flex min-h-tap items-center" href={`/admin/content/edit?path=${encodeURIComponent(p)}&lang=${lang}`}>Edit</Link>
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
