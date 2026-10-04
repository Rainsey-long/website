/** Admin: edit one long-form page in one language (Markdown with front matter). */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContentEditor } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isContentPath, repoSource } from "@/lib/content";
import { isLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ path?: string; lang?: string }> };

export default async function EditContent({ searchParams }: Search) {
  if (!(await getSession())) redirect("/admin/login");
  const { path = "", lang = "" } = await searchParams;
  if (!isContentPath(path) || !isLang(lang)) notFound();
  const row = getDb().prepare("SELECT source, updated_at, updated_by FROM content_overrides WHERE path = ? AND lang = ?").get(path, lang) as { source: string; updated_at: string; updated_by: string | null } | undefined;
  const original = repoSource(path, lang);
  // A Khmer page with no Khmer yet starts from the English text to translate.
  const start = row?.source ?? original ?? repoSource(path, "en") ?? "";
  return (
    <section>
      <p className="text-small"><Link className="link" href="/admin/content">All profiles and forecasts</Link></p>
      <h1 className="mt-2 text-h1 break-words">{path} <span className="text-muted">({lang === "km" ? "Khmer" : "English"})</span></h1>
      <p className="mt-2 max-w-reading text-small text-muted">
        {row ? `Showing your edit from ${row.updated_at.slice(0, 16)} UTC${row.updated_by ? ` by ${row.updated_by}` : ""}.` : original ? "Showing the original file." : "No Khmer version yet: this starts from the English text. Translate it and save."}
        {" "}Keep the part between the --- lines in the same shape; slug, animal, relation and outlook must not change. HTML is shown as plain text.
      </p>
      <ContentEditor path={path} lang={lang} initial={start} edited={!!row} />
    </section>
  );
}
