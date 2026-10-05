import type { Metadata, Viewport } from "next";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource/figtree/latin-400.css";
import "@fontsource/figtree/latin-500.css";
import "@fontsource/figtree/latin-600.css";
import "@fontsource/figtree/latin-ext-400.css";
import "@fontsource/kantumruy-pro/khmer-400.css";
import "@fontsource/kantumruy-pro/khmer-600.css";
import "@fontsource/noto-serif-khmer/khmer-400.css";
import "@fontsource/noto-serif-khmer/khmer-500.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ZoneCookie from "@/components/client/ZoneCookie";
import ServiceWorkerRegister from "@/components/client/ServiceWorkerRegister";
import { FEATURES, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { visitorZone } from "@/lib/today";
import { getLang } from "@/lib/langServer";
import { LANG_TAG } from "@/lib/i18n";
import { LangProvider } from "@/components/client/LangProvider";
import AdsScript from "@/components/client/AdsScript";
import { ADSENSE_ACCOUNT_ID, adsenseAccountConfigured } from "@/lib/ads";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: "Daily horoscopes, the Chinese zodiac, Khmer traditions and lucky days, written from where the Moon really is today.",
  icons: { icon: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
  // AdSense site verification (lib/ads.ts): a meta tag only, no script.
  other: adsenseAccountConfigured() ? { "google-adsense-account": ADSENSE_ACCOUNT_ID } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#141933" },
  ],
};

/** Applied before first paint so a saved theme never flashes (§2.2). Directive-free inline script. */
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const zone = await visitorZone();
  const lang = await getLang();
  return (
    <html lang={LANG_TAG[lang]} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <LangProvider lang={lang}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-raised focus:p-3 focus:rounded-sm">{"Skip to content"}</a>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
          <div id="toast" role="status" aria-live="polite" className="toast" hidden />
          <ZoneCookie serverZone={zone} />
          <ServiceWorkerRegister />
          <AdsScript />
        </LangProvider>
        {FEATURES.CF_ANALYTICS_TOKEN && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: FEATURES.CF_ANALYTICS_TOKEN })} />
        )}
      </body>
    </html>
  );
}
