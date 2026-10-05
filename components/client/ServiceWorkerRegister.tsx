"use client";
/**
 * Registers public/sw.js (offline pages, FEATURES.md #48). Production only:
 * in development a cached page would hide the change being worked on.
 * Renders nothing.
 */
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Offline support is a convenience; a failed registration changes nothing else.
    });
  }, []);
  return null;
}
