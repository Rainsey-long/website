import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SignOut } from "@/components/client/AdminForms";

/** Admin is never indexed (robots.ts disallows it too). English only (DECISIONS.md). */
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SECTIONS: Array<[string, string]> = [
  ["/admin", "Overview"],
  ["/admin/readings", "Readings"],
  ["/admin/content", "Profiles and forecasts"],
  ["/admin/songkran", "Khmer New Year"],
  ["/admin/feedback", "Feedback"],
  ["/admin/accounts", "Admins"],
  ["/admin/backups", "Backups"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The nav is chrome only; every page and API route checks the session itself.
  const session = await getSession();
  return (
    <div className="mx-auto max-w-page safe-x py-6">
      {session && (
        <div className="mb-6 border-b border-rule pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-small text-muted">Signed in as <span className="font-semibold text-ink">{session.username}</span></p>
            <SignOut />
          </div>
          <nav aria-label="Admin sections" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small">
            {SECTIONS.map(([href, label]) => <Link key={href} href={href} className="link inline-flex min-h-tap items-center">{label}</Link>)}
          </nav>
        </div>
      )}
      {children}
    </div>
  );
}
