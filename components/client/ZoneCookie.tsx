"use client";
/**
 * Tells the server the visitor's time zone (cookie `tz`) so "today" is their
 * local date (§8.5). If the zone was unknown or different, refresh once.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { setCookie } from "@/lib/client";

export default function ZoneCookie({ serverZone }: { serverZone: string }) {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === serverZone) return;
    setCookie("tz", tz);
    router.refresh();
  }, [serverZone, router]);
  return null;
}
