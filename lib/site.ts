/**
 * Single source for brand, domain and feature flags.
 * SITE_NAME and DOMAIN are placeholders until the owner decides (build plan §13).
 */
export const SITE_NAME = "Almanac";
export const DOMAIN = "example.com";
/** Absolute origin. Set NEXT_PUBLIC_SITE_URL in Railway's BUILD environment (it is inlined). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://${DOMAIN}`).replace(/\/$/, "");
export const SITE_TAGLINE = "Daily horoscopes, Chinese zodiac and lucky days";
export const SITE_TAGLINE_KM = "ហោរាសាស្ត្រប្រចាំថ្ងៃ ឆ្នាំចិន និងថ្ងៃល្អ";

/** Dated daily pages listed in the sitemap: last N days + next M days. Any date 1900–2100 still renders. */
export const DAILY_WINDOW = { pastDays: 60, futureDays: 2 };

/** "Today" for a visitor whose zone we don't know yet (the owner is in Cambodia). */
export const DEFAULT_TZ = "Asia/Phnom_Penh";

/** Calendar months are valid for any year in this range. */
export const CALENDAR_YEARS = { min: 1900, max: 2100 };

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
  /**
   * 403 the named AI-training crawlers (CamboMath's list, lib/aiBots.ts).
   * Owner decision: answer-engine bots (OAI-SearchBot, PerplexityBot,
   * Claude-SearchBot) can send traffic; to allow them, edit the list.
   */
  BLOCK_AI_CRAWLERS: true,
  /** Cloudflare Web Analytics beacon token. Empty = no beacon. */
  CF_ANALYTICS_TOKEN: "",
};

export const DISCLAIMER =
  "For entertainment and reflection. Not medical, legal, or financial advice.";
export const DISCLAIMER_KM =
  "សម្រាប់ការកម្សាន្ត និងការពិចារណា។ មិនមែនជាដំបូន្មានវេជ្ជសាស្ត្រ ច្បាប់ ឬហិរញ្ញវត្ថុឡើយ។";

export const CONTACT_EMAIL = `hello@${DOMAIN}`;
