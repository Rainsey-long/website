import type { Metadata } from "next";
import Link from "@/components/client/LocaleLink";
import { getSession } from "@/lib/auth";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { SignOut } from "@/components/client/AdminForms";

/** Admin is never indexed (robots.ts disallows it too). Bilingual: /km/admin is the Khmer twin (docs/I18N.md). */
const T = defineMessages({
  en: {
    title: "Admin",
    signedInAs: "Signed in as",
    sections: "Admin sections",
    overview: "Overview",
    readings: "Readings",
    content: "Profiles and forecasts",
    songkran: "Khmer New Year",
    feedback: "Feedback",
    accounts: "Admins",
    backups: "Backups",
  },
  km: {
    title: "អ្នកគ្រប់គ្រង",
    signedInAs: "បានចូលជា",
    sections: "ផ្នែកនៃទំព័រអ្នកគ្រប់គ្រង",
    overview: "ទិដ្ឋភាពទូទៅ",
    readings: "ការទស្សន៍ទាយប្រចាំថ្ងៃ",
    content: "ប្រវត្តិរូប និងការព្យាករណ៍",
    songkran: "ចូលឆ្នាំខ្មែរ",
    feedback: "មតិយោបល់",
    accounts: "អ្នកគ្រប់គ្រង",
    backups: "ការបម្រុងទុក",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: T[lang].title, robots: { index: false, follow: false } };
}
export const dynamic = "force-dynamic";

const SECTIONS: Array<[string, keyof (typeof T)["en"]]> = [
  ["/admin", "overview"],
  ["/admin/readings", "readings"],
  ["/admin/content", "content"],
  ["/admin/songkran", "songkran"],
  ["/admin/feedback", "feedback"],
  ["/admin/accounts", "accounts"],
  ["/admin/backups", "backups"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The nav is chrome only; every page and API route checks the session itself.
  const session = await getSession();
  const t = T[await getLang()];
  return (
    <div className="mx-auto max-w-page safe-x py-6">
      {session && (
        <div className="mb-6 border-b border-rule pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-small text-muted">{t.signedInAs} <span className="font-semibold text-ink" lang="en">{session.username}</span></p>
            <SignOut />
          </div>
          <nav aria-label={t.sections} className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small">
            {SECTIONS.map(([href, key]) => <Link key={href} href={href} className="link inline-flex min-h-tap items-center">{t[key]}</Link>)}
          </nav>
        </div>
      )}
      {children}
    </div>
  );
}
