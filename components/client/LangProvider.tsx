"use client";
/**
 * The page language for client components (lib/i18n.ts). The root layout
 * reads it on the server from the proxy's header and hands it down here, so
 * the first render is already in the right language (no flash, no mismatch).
 */
import { createContext, useContext } from "react";
import { localePath, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);

/** Turns an internal path into the current language's URL. */
export function useLocalePath(): (path: string) => string {
  const lang = useLang();
  return (path) => localePath(path, lang);
}
