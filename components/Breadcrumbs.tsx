/** Breadcrumbs — visible trail plus BreadcrumbList JSON-LD. The last item is the current page. */
import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export default function Breadcrumbs({ items }: { items: Array<{ name: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-page safe-x pt-5">
      <JsonLd data={[breadcrumbLd(items)]} />
      <ol className="flex flex-wrap gap-x-2 gap-y-1 text-small text-muted">
        <li><Link className="link" href="/">Home</Link></li>
        {items.map((c, i) => (
          <li key={c.href} className="flex gap-2">
            <span aria-hidden="true">/</span>
            {i === items.length - 1 ? <span aria-current="page">{c.name}</span> : <Link className="link" href={c.href}>{c.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
