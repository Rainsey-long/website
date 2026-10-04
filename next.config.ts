import type { NextConfig } from "next";

/**
 * Security headers on every route (CamboMath next.config.ts, adapted).
 * script-src keeps 'unsafe-inline': the App Router streams RSC payloads
 * through inline scripts, and removing it silently stops hydration.
 * Cloudflare Web Analytics is the only third-party script, and only when its
 * token is set.
 */
const isDev = process.env.NODE_ENV !== "production";
const cf = { script: " https://static.cloudflareinsights.com", connect: " https://cloudflareinsights.com" };

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${cf.script};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self'${cf.connect};
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
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
