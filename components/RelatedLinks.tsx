import Link from "@/components/client/LocaleLink";
/** RelatedLinks — a proper link list (wireframe §7.2 "Related"). */
export default function RelatedLinks({ heading = "Related", links }: { heading?: string; links: Array<{ href: string; label: string }> }) {
  return (
    <nav aria-labelledby="related-h" className="mt-7 border-t border-rule pt-5">
      <h2 id="related-h" className="text-h3">{heading}</h2>
      <ul className="mt-3 flex flex-col gap-1">
        {links.map((l) => <li key={l.href}><Link className="link inline-flex min-h-tap items-center" href={l.href}>{l.label}</Link></li>)}
      </ul>
    </nav>
  );
}
