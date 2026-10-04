// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://example.com"; // keep in step with src/config/site.ts DOMAIN

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
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
