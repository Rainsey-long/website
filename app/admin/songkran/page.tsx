/** Admin: the official Khmer New Year (Moha Songkran) moment and saying, this year and next. */
import { redirect } from "next/navigation";
import { SongkranForm } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";
import { defineMessages, localePath, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Khmer New Year",
    lead: "Each year the Ministry of Cults and Religion announces the exact minute of Moha Songkran. Enter it here; until then the site shows the calculated moment. Leave a field empty to go back to the calculation.",
  },
});

export default async function SongkranAdmin() {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const now = new Date();
  const year = now.getUTCFullYear() + (now.getUTCMonth() >= 4 ? 1 : 0);
  return (
    <section>
      <h1 className="text-h1">{T[lang].title}</h1>
      <p className="mt-2 max-w-reading text-small text-muted">{T[lang].lead}</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {[year, year + 1].map((y) => {
          const o = songkranOverride(y);
          const c = songkran(y);
          return (
            <div key={y}>
              <h2 className="text-h2">{num(y, lang)}</h2>
              <SongkranForm year={y} officialAt={o?.official_at ?? ""} tumneay={o?.tumneay ?? ""} source={o?.source ?? ""} calculated={`${c.date} ${c.time}`} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
