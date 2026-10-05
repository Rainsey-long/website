/** Admin: edit one long-form page (Markdown with front matter). English only. */
import Link from "@/components/client/LocaleLink";
import { notFound, redirect } from "next/navigation";
import { ContentEditor } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isContentPath, repoSource } from "@/lib/content";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ path?: string }> };

const T = defineMessages({
  en: {
    back: "All profiles and forecasts",
    showingEdit: (at: string, by: string | null) => `Showing your edit from ${at} UTC${by ? ` by ${by}` : ""}.`,
    showingOriginal: "Showing the original file.",
    noFile: "No original file: this starts empty.",
    shape: "Keep the part between the --- lines in the same shape; slug, animal, relation and outlook must not change. HTML is shown as plain text.",
  },
});

export default async function EditContent({ searchParams }: Search) {
  const ui = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", ui));
  const t = T[ui];
  const { path = "" } = await searchParams;
  if (!isContentPath(path)) notFound();
  const row = getDb().prepare("SELECT source, updated_at, updated_by FROM content_overrides WHERE path = ? AND lang = 'en'").get(path) as { source: string; updated_at: string; updated_by: string | null } | undefined;
  const original = repoSource(path, "en");
  const start = row?.source ?? original ?? "";
  const at = row ? row.updated_at.slice(0, 16) : "";
  return (
    <section>
      <p className="text-small"><Link className="link" href="/admin/content">{t.back}</Link></p>
      <h1 className="mt-2 text-h1 break-words"><span lang="en">{path}</span></h1>
      <p className="mt-2 max-w-reading text-small text-muted">
        {row ? t.showingEdit(at, row.updated_by) : original ? t.showingOriginal : t.noFile}
        {" "}{t.shape}
      </p>
      <ContentEditor path={path} initial={start} edited={!!row} />
    </section>
  );
}
