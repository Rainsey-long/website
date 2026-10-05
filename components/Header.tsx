/**
 * Header (§6.10): wordmark, primary nav, "My sign", traditions, theme
 * toggle; mobile collapses to wordmark + menu sheet.
 */
import Link from "./client/LocaleLink";
import { SITE_NAME } from "@/lib/site";
import { chosenTraditions } from "@/lib/traditionsServer";
import { MenuSheet, MySignChip, ThemeToggle, TraditionsMenu } from "./client/HeaderControls";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/horoscope", label: "Horoscopes" },
  { href: "/chinese-zodiac", label: "Chinese zodiac" },
  { href: "/khmer", label: "Khmer" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/lucky-days", label: "Lucky days" },
  { href: "/sky", label: "Sky" },
];

const SEARCH = { href: "/search", label: "Search" };

export default async function Header() {
  const traditions = await chosenTraditions();
  return (
    <header className="border-b border-rule bg-paper" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-page items-center gap-3 safe-x py-3">
        <Link href="/" className="serif mr-auto text-h3 no-underline" style={{ fontWeight: 500 }}>{SITE_NAME}</Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-5">
            {NAV.map((n) => <li key={n.href}><Link href={n.href} className="link nav-link">{n.label}</Link></li>)}
          </ul>
        </nav>
        <Link href={SEARCH.href} aria-label={SEARCH.label} title={SEARCH.label} className="hidden size-tap items-center justify-center rounded-full no-underline lg:inline-flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-glyph" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4.35-4.35" />
          </svg>
        </Link>
        <MySignChip />
        <TraditionsMenu initial={traditions} />
        <ThemeToggle />
        <MenuSheet nav={[{ href: SEARCH.href, label: SEARCH.label }, ...NAV]} />
      </div>
    </header>
  );
}
