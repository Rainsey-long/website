/** Admin: edit one long-form page in one language (Markdown with front matter). */
import Link from "@/components/client/LocaleLink";
import { notFound, redirect } from "next/navigation";
import { ContentEditor } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isContentPath, repoSource } from "@/lib/content";
import { longDate } from "@/lib/dates";
import { defineMessages, isLang, khmerDigits, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ path?: string; lang?: string }> };

const T = defineMessages({
  en: {
    back: "All profiles and forecasts",
    langName: { en: "English", km: "Khmer" },
    showingEdit: (at: string, by: string | null) => `Showing your edit from ${at} UTC${by ? ` by ${by}` : ""}.`,
    showingOriginal: "Showing the original file.",
    noKm: "No Khmer version yet: this starts from the English text. Translate it and save.",
    shape: "Keep the part between the --- lines in the same shape; slug, animal, relation and outlook must not change. HTML is shown as plain text.",
  },
  km: {
    back: "ប្រវត្តិរូប និងការព្យាករណ៍ទាំងអស់",
    langName: { en: "ភាសាអង់គ្លេស", km: "ភាសាខ្មែរ" },
    showingEdit: (at: string, by: string | null) => `កំពុងបង្ហាញការកែរបស់អ្នក ពី ${at} UTC${by ? ` ដោយ ${by}` : ""}។`,
    showingOriginal: "កំពុងបង្ហាញឯកសារដើម។",
    noKm: "មិនទាន់មានភាសាខ្មែរ៖ ទំព័រនេះចាប់ផ្ដើមពីអត្ថបទអង់គ្លេស។ សូមបកប្រែ ហើយរក្សាទុក។",
    shape: "រក្សាផ្នែកចន្លោះបន្ទាត់ --- ឱ្យនៅទម្រង់ដដែល ហើយមិនត្រូវប្ដូរ slug animal relation និង outlook ទេ។ HTML បង្ហាញជាអត្ថបទធម្មតា។",
  },
});

export default async function EditContent({ searchParams }: Search) {
  const ui = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", ui));
  const t = T[ui];
  // `lang` here is the language of the TEXT being edited, not of the page.
  const { path = "", lang = "" } = await searchParams;
  if (!isContentPath(path) || !isLang(lang)) notFound();
  const row = getDb().prepare("SELECT source, updated_at, updated_by FROM content_overrides WHERE path = ? AND lang = ?").get(path, lang) as { source: string; updated_at: string; updated_by: string | null } | undefined;
  const original = repoSource(path, lang);
  // A Khmer page with no Khmer yet starts from the English text to translate.
  const start = row?.source ?? original ?? repoSource(path, "en") ?? "";
  const at = row ? (ui === "km" ? `${longDate(row.updated_at.slice(0, 10), "km")} ម៉ោង ${khmerDigits(row.updated_at.slice(11, 16))}` : row.updated_at.slice(0, 16)) : "";
  return (
    <section>
      <p className="text-small"><Link className="link" href="/admin/content">{t.back}</Link></p>
      <h1 className="mt-2 text-h1 break-words"><span lang="en">{path}</span> <span className="text-muted">({t.langName[lang]})</span></h1>
      <p className="mt-2 max-w-reading text-small text-muted">
        {row ? t.showingEdit(at, row.updated_by) : original ? t.showingOriginal : t.noKm}
        {" "}{t.shape}
      </p>
      <ContentEditor path={path} lang={lang} initial={start} edited={!!row} />
    </section>
  );
}
