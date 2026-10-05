/**
 * Header (§6.10): wordmark, primary nav, "My sign", traditions, language
 * switch, theme toggle; mobile collapses to wordmark + menu sheet.
 */
import Link from "./client/LocaleLink";
import { SITE_NAME } from "@/lib/site";
import { chosenTraditions } from "@/lib/traditionsServer";
import { getLang } from "@/lib/langServer";
import type { Lang } from "@/lib/i18n";
import { MenuSheet, MySignChip, ThemeToggle, TraditionsMenu } from "./client/HeaderControls";
import LanguageSwitch from "./client/LanguageSwitch";

const NAV: Array<{ href: string; label: Record<Lang, string> }> = [
  { href: "/horoscope", label: { en: "Horoscopes", km: "ហោរាសាស្ត្រ" } },
  { href: "/chinese-zodiac", label: { en: "Chinese zodiac", km: "ឆ្នាំចិន" } },
  { href: "/khmer", label: { en: "Khmer", km: "ប្រពៃណីខ្មែរ" } },
  { href: "/compatibility", label: { en: "Compatibility", km: "ភាពត្រូវគ្នា" } },
  { href: "/lucky-days", label: { en: "Lucky days", km: "ថ្ងៃល្អ" } },
  { href: "/sky", label: { en: "Sky", km: "មេឃ" } },
];

const SEARCH = { href: "/search", label: { en: "Search", km: "ស្វែងរក" } as Record<Lang, string> };

export default async function Header() {
  const [traditions, lang] = await Promise.all([chosenTraditions(), getLang()]);
  const nav = NAV.map((n) => ({ href: n.href, label: n.label[lang] }));
  return (
    <header className="border-b border-rule bg-paper" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-page items-center gap-3 safe-x py-3">
        <Link href="/" className="serif mr-auto text-h3 no-underline" style={{ fontWeight: 500 }}>{SITE_NAME}</Link>
        <nav aria-label={lang === "km" ? "ការរុករកមេ" : "Main"} className="hidden lg:block">
          <ul className="flex items-center gap-5">
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="link nav-link">{n.label}</Link></li>)}
          </ul>
        </nav>
        <Link href={SEARCH.href} aria-label={SEARCH.label[lang]} title={SEARCH.label[lang]} className="hidden size-tap items-center justify-center rounded-full no-underline lg:inline-flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-glyph" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4.35-4.35" />
          </svg>
        </Link>
        <MySignChip />
        <TraditionsMenu initial={traditions} />
        <LanguageSwitch className="min-w-tap justify-center px-1 text-small font-semibold" />
        <ThemeToggle />
        <MenuSheet nav={[{ href: SEARCH.href, label: SEARCH.label[lang] }, ...nav]} />
      </div>
    </header>
  );
}
