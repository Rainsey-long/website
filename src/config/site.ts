/**
 * Single source for brand, domain and feature flags.
 * SITE_NAME and DOMAIN are placeholders until the owner decides (build plan §13).
 */
export const SITE_NAME = "Almanac";
export const DOMAIN = "example.com";
export const SITE_URL = `https://${DOMAIN}`;
export const SITE_TAGLINE = "Daily horoscopes, Chinese zodiac and lucky days";

/** Rolling window of dated daily pages, relative to the build date (plan §10). */
export const DAILY_WINDOW = { pastDays: 60, futureDays: 2 };

/** Years that get Lucky days calendar pages. */
export const ALMANAC_YEARS = [2026, 2027];

/** Monetization and retention hooks: built now, switched on later (plan §11). */
export const FEATURES = {
  ADS_ENABLED: false,
  AD_PROVIDER: "adsense" as const,
  AD_CLIENT_ID: "",
  AD_SLOTS: { afterReading: "", rail: "", inContent: "" },
  AFFILIATES_ENABLED: false,
  REPORT_CTA_ENABLED: false,
  REPORT_URL: "https://example.lemonsqueezy.com/",
  EMAIL_SIGNUP_ENABLED: false,
  PUSH_ENABLED: false,
  /** Cloudflare Web Analytics beacon token. Empty = no beacon. */
  CF_ANALYTICS_TOKEN: "",
};

export const DISCLAIMER =
  "For entertainment and reflection. Not medical, legal, or financial advice.";

export const CONTACT_EMAIL = `hello@${DOMAIN}`;
