"use client";
/**
 * Loads the AdSense tag (lib/ads.ts) on content pages once a publisher id is
 * configured; renders nothing otherwise. The tag also shows Google's consent
 * message to visitors in the EEA, UK and Switzerland (set up in AdSense →
 * Privacy & messaging), so it loads on content pages without a slot too: the
 * first page a visitor opens is where consent is asked. Never on the admin,
 * API, search, offline, styleguide or print pages, nor on the tools that take
 * birth details.
 *
 * A loaded script outlives client-side navigation (next/script never removes
 * it), so arriving on an excluded page within the site with the tag already
 * loaded reloads that page: the fresh document starts without the tag, before
 * anything is typed into a form (CamboMath's AdRouteIsolation, simplified).
 */
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AD_CLIENT_ID, adsAllowedOnPath } from "@/lib/ads";

export default function AdsScript() {
  const path = usePathname() ?? "/";
  const allowed = adsAllowedOnPath(path);
  useEffect(() => {
    if (!allowed && document.querySelector('script[src*="adsbygoogle.js"]')) window.location.reload();
  }, [allowed, path]);
  if (!allowed) return null;
  return (
    <Script
      id="adsbygoogle-tag"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(AD_CLIENT_ID)}`}
    />
  );
}
