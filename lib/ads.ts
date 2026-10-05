/**
 * Google AdSense: the single gate for every ad decision (docs/ADSENSE.md).
 * Adapted from CamboMath's lib/ads.ts; this site is for adults, so it may
 * serve personalised ads where the visitor consents.
 *
 * SHIPS INERT. With NEXT_PUBLIC_AD_CLIENT_ID unset (the default) nothing
 * loads: no script, no slot, no CSP host, and /ads.txt 404s unless the
 * account id below is set for verification. The privacy policy reads the same
 * flags, so it always describes what the site actually does.
 *
 * CONSENT. Google requires a Google-certified CMP for personalised ads in the
 * EEA and UK (since 16 January 2024) and Switzerland (since 31 July 2024)
 * (support.google.com/adsense/answer/13554116, read 2026-10-05). The site uses
 * Google's own consent message (AdSense → Privacy & messaging), which is
 * delivered by the AdSense tag itself: switching it on is an account setting,
 * not code. The footer's "Privacy and cookie settings" link reopens it.
 */

/** AdSense publisher id, e.g. "ca-pub-1234567890123456". Empty = ads off. */
export const AD_CLIENT_ID = (process.env.NEXT_PUBLIC_AD_CLIENT_ID ?? "").trim();

/** Shape-checked, so a half-filled variable fails closed to "ads off". */
export function adsConfigured(): boolean {
  return /^ca-pub-\d{10,}$/.test(AD_CLIENT_ID);
}

/**
 * Account id for site verification only: the google-adsense-account meta tag
 * and /ads.txt. Lets the owner verify the site BEFORE approval without
 * turning on the script, the CSP hosts or the privacy-policy ad wording.
 */
export const ADSENSE_ACCOUNT_ID = (process.env.NEXT_PUBLIC_ADSENSE_ACCOUNT ?? "").trim() || AD_CLIENT_ID;

export function adsenseAccountConfigured(): boolean {
  return /^ca-pub-\d{10,}$/.test(ADSENSE_ACCOUNT_ID);
}

/** The line Google expects in /ads.txt (f08c47fec0942fa0 is Google's TAG id). */
export function adsTxt(): string | null {
  if (!adsenseAccountConfigured()) return null;
  return `google.com, ${ADSENSE_ACCOUNT_ID.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`;
}

export type Placement = "afterReading" | "inContent" | "rail";

/** One ad unit per placement, so reporting shows which placement earns. Empty = that placement shows nothing. */
export const AD_SLOTS: Record<Placement, string> = {
  afterReading: (process.env.NEXT_PUBLIC_AD_SLOT_AFTER_READING ?? "").trim(),
  inContent: (process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT ?? "").trim(),
  rail: (process.env.NEXT_PUBLIC_AD_SLOT_RAIL ?? "").trim(),
};

export const slotConfigured = (p: Placement) => adsConfigured() && /^\d{6,}$/.test(AD_SLOTS[p]);

/**
 * Paths where the AdSense tag must never load: no publisher content (AdSense
 * Program policies forbid ads on non-content pages), private tooling, or a
 * page made for printing. Prefix match on purpose: everything under them.
 * Ad SLOTS are placed only on reading and profile pages (DESIGN_SYSTEM §6.11);
 * the tag itself loads on other content pages too, so the consent message can
 * be shown and answered on the first page a visitor opens.
 */
// /tools and the finder take birth details or personal dates, which the
// privacy policy promises never leave the browser: a third-party script on
// those pages could read the form or the page address (security audit
// 2026-10-05). Ads stay off them entirely.
const NO_AD_PREFIXES = ["/admin", "/api", "/offline", "/search", "/styleguide", "/tools", "/lucky-days/finder"];

export function adsAllowedOnPath(path: string): boolean {
  if (!adsConfigured()) return false;
  if (/\/print$/.test(path)) return false;
  return !NO_AD_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Hosts the CSP adds only when ads are configured (next.config.ts). Taken
 * from CamboMath's verified list: AdSense, Google's consent message
 * (fundingchoicesmessages), SafeFrame creatives and Google's invalid-traffic
 * checks (adtrafficquality), which also need connect-src to report.
 */
export const AD_CSP_HOSTS = {
  script: ["https://pagead2.googlesyndication.com", "https://partner.googleadservices.com", "https://tpc.googlesyndication.com", "https://adservice.google.com", "https://fundingchoicesmessages.google.com", "https://adtrafficquality.google", "https://*.adtrafficquality.google"],
  frame: ["https://fundingchoicesmessages.google.com", "https://googleads.g.doubleclick.net", "https://*.safeframe.googlesyndication.com", "https://tpc.googlesyndication.com", "https://www.google.com", "https://adtrafficquality.google", "https://*.adtrafficquality.google"],
  img: ["https://pagead2.googlesyndication.com", "https://tpc.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://www.google.com", "https://adtrafficquality.google", "https://*.adtrafficquality.google"],
  connect: ["https://fundingchoicesmessages.google.com", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://adservice.google.com", "https://tpc.googlesyndication.com", "https://adtrafficquality.google", "https://*.adtrafficquality.google"],
} as const;
