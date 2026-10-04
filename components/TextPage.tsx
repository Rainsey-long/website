/** Simple reading-column page for informational and legal content. */
import Breadcrumbs from "./Breadcrumbs";

export default function TextPage({ title, path, updated, children, crumbs }: { title: string; path: string; updated?: string; children: React.ReactNode; crumbs?: Array<{ name: string; href: string }> }) {
  return (
    <>
      <Breadcrumbs items={[...(crumbs ?? []), { name: title, href: path }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{title}</h1>
        {updated && <p className="mt-2 text-small text-muted">Last updated {updated}</p>}
        <div className="prose reading mt-6">{children}</div>
      </div>
    </>
  );
}
