/**
 * Header (§6.10): wordmark, primary nav, "My sign", traditions, theme toggle;
 * mobile collapses to wordmark + menu sheet. Language switch: Phase 7 (DECISIONS.md).
 */
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { chosenTraditions } from "@/lib/traditionsServer";
import { MenuSheet, MySignChip, ThemeToggle, TraditionsMenu } from "./client/HeaderControls";

export const NAV = [
  { href: "/horoscope", label: "Horoscopes" },
  { href: "/chinese-zodiac", label: "Chinese zodiac" },
  { href: "/khmer", label: "Khmer" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/lucky-days", label: "Lucky days" },
  { href: "/sky", label: "Sky" },
];

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
        <MySignChip />
        <TraditionsMenu initial={traditions} />
        <ThemeToggle />
        <MenuSheet nav={NAV} />
      </div>
    </header>
  );
}
