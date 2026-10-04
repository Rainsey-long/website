import type { Metadata } from "next";
/** Admin is never indexed (robots.ts disallows it too). */
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-page safe-x py-6">{children}</div>;
}
