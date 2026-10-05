"use client";
/**
 * One responsive AdSense unit inside the reserved AdSlot box (DESIGN_SYSTEM
 * §6.11). Pushes itself once after mount; the box keeps its height so the
 * page never shifts when the creative arrives.
 */
import { useEffect, useRef } from "react";
import { AD_CLIENT_ID } from "@/lib/ads";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export default function AdUnit({ slot }: { slot: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // The tag may be blocked (an ad blocker, or no consent yet); the box stays empty.
    }
  }, []);
  return (
    <ins
      className="adsbygoogle block h-full w-full"
      data-ad-client={AD_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
