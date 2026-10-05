import type { NextConfig } from "next";
import { AD_CSP_HOSTS, adsConfigured } from "./lib/ads";

/**
 * Security headers on every route (CamboMath next.config.ts, adapted).
 * script-src keeps 'unsafe-inline': the App Router streams RSC payloads
 * through inline scripts, and removing it silently stops hydration.
 * Third parties: Cloudflare Web Analytics (when its token is set) and Google
 * AdSense with its consent message, whose hosts are added only when a
 * publisher id is configured (lib/ads.ts, AD_CSP_HOSTS); NEXT_PUBLIC_* is
 * read at build time, like the CSP itself.
 */
const isDev = process.env.NODE_ENV !== "production";
const cf = { script: " https://static.cloudflareinsights.com", connect: " https://cloudflareinsights.com" };
const ads = (k: keyof typeof AD_CSP_HOSTS) => (adsConfigured() ? " " + AD_CSP_HOSTS[k].join(" ") : "");

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${cf.script}${ads("script")};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:${ads("img")};
  font-src 'self';
  connect-src 'self'${cf.connect}${ads("connect")};${adsConfigured() ? ` frame-src${ads("frame")};` : ""}
  worker-src 'self';
  manifest-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const permissionsPolicy = "camera=(), microphone=(), geolocation=(), browsing-topics=(), join-ad-interest-group=(), run-ad-auction=(), attribution-reporting=()";

const nextConfig: NextConfig = {
  experimental: {
    /** Bytes per in-flight request an anonymous POST can reserve. No uploads here, so small. */
    proxyClientMaxBodySize: "1mb",
  },
  /** The image optimiser is an unauthenticated CPU sink and nothing here uses it. */
  images: { unoptimized: true },
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // includeSubDomains, no preload: preload is an owner decision, effectively irreversible.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      // The service worker must be re-checked on every visit so a fix reaches visitors at once.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Content-Type", value: "application/javascript; charset=utf-8" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
