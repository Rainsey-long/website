"use client";
/**
 * "Privacy and cookie settings": reopens Google's consent message so a
 * visitor can change or withdraw consent at any time (GDPR art. 7(3)). Shown
 * only when ads are configured (lib/ads.ts); the message itself comes from
 * AdSense → Privacy & messaging. Hidden on pages without the tag
 * (lib/ads.ts adsAllowedOnPath), where it could not open anything.
 */
import { usePathname } from "next/navigation";
import { adsAllowedOnPath } from "@/lib/ads";

type GoogleFc = { callbackQueue?: Array<() => void>; showRevocationMessage?: () => void };
declare global {
  interface Window { googlefc?: GoogleFc }
}

export default function PrivacyChoices({ className = "" }: { className?: string }) {
  const path = usePathname() ?? "/";
  // Only where the AdSense tag (and with it the consent message) is loaded.
  if (!adsAllowedOnPath(path)) return null;
  const open = () => {
    const fc = (window.googlefc = window.googlefc || {});
    fc.callbackQueue = fc.callbackQueue || [];
    fc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.());
  };
  return (
    <button type="button" onClick={open} className={`link inline-flex min-h-tap items-center ${className}`}>
      Privacy and cookie settings
    </button>
  );
}
