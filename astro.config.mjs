// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { pairRedirects } from "./scripts/pair-redirects.mjs";

const SITE = "https://example.com"; // keep in step with src/config/site.ts DOMAIN

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  // Static fallback for reversed pair URLs; Cloudflare serves real 301s from dist/_redirects.
  redirects: pairRedirects(),
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/styleguide/"),
      // Split by section (plan §9): one child sitemap per top-level path.
      chunks: {
        horoscopes: (item) => (/\/horoscope\//.test(item.url) ? item : undefined),
        compatibility: (item) => (/compatibility\//.test(item.url) ? item : undefined),
        "lucky-days": (item) => (/\/lucky-days\//.test(item.url) ? item : undefined),
        zodiac: (item) => (/\/(chinese-)?zodiac\//.test(item.url) ? item : undefined),
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
