"use client";
/**
 * The page language for client components. The site is English only
 * (2026-10-05), so this always answers "en"; the provider and hooks stay
 * because many components still import them.
 */
import type { Lang } from "@/lib/i18n";

/** Kept for the root layout; there is nothing to provide any more. */
export function LangProvider({ children }: { lang?: Lang; children: React.ReactNode }) {
  return <>{children}</>;
}

export const useLang = (): Lang => "en";

/** Kept for existing call sites: an internal path is its own URL. */
export function useLocalePath(): (path: string) => string {
  return (path) => path;
}
