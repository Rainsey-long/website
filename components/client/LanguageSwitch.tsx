"use client";
/**
 * Language switch (DESIGN_SYSTEM §6.10): a link to this page's twin in the
 * other language. It also writes the language cookie, which proxy.ts reads to
 * keep a Khmer reader on /km URLs; choosing English must clear that, or the
 * proxy would send them straight back.
 */
import { usePathname } from "next/navigation";
import { LANG_COOKIE, LANG_NAME, localePath, stripLocale, type Lang } from "@/lib/i18n";
import { setCookie } from "@/lib/client";
import { useLang } from "./LangProvider";

export default function LanguageSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const other: Lang = lang === "en" ? "km" : "en";
  const pathname = usePathname() ?? "/";
  const target = localePath(stripLocale(pathname).path, other);
  return (
    // A full navigation, not a client transition: the whole tree, including the
    // server-rendered header and metadata, has to re-render in the other language.
    <a href={target} hrefLang={other} lang={other} className={`link inline-flex min-h-tap items-center ${className}`}
      onClick={(e) => {
        setCookie(LANG_COOKIE, other);
        // Keep the query string (a chosen city or date) across the switch.
        e.preventDefault();
        window.location.assign(target + window.location.search + window.location.hash);
      }}>
      {LANG_NAME[other]}
    </a>
  );
}
