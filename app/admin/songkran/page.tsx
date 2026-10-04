/** Admin: the official Khmer New Year (Moha Songkran) moment and saying, this year and next. */
import { redirect } from "next/navigation";
import { SongkranForm } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";

export const dynamic = "force-dynamic";

export default async function SongkranAdmin() {
  if (!(await getSession())) redirect("/admin/login");
  const now = new Date();
  const year = now.getUTCFullYear() + (now.getUTCMonth() >= 4 ? 1 : 0);
  return (
    <section>
      <h1 className="text-h1">Khmer New Year</h1>
      <p className="mt-2 max-w-reading text-small text-muted">Each year the Ministry of Cults and Religion announces the exact minute of Moha Songkran. Enter it here; until then the site shows the calculated moment. Leave a field empty to go back to the calculation.</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {[year, year + 1].map((y) => {
          const o = songkranOverride(y);
          const c = songkran(y);
          return (
            <div key={y}>
              <h2 className="text-h2">{y}</h2>
              <SongkranForm year={y} officialAt={o?.official_at ?? ""} tumneay={o?.tumneay ?? ""} source={o?.source ?? ""} calculated={`${c.date} ${c.time}`} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
