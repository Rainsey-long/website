"use client";
/**
 * next/link with the current language applied: "/sky" becomes "/km/sky" on a
 * Khmer page. Use it everywhere instead of next/link (server components can
 * render it too). External URLs, #hashes and unlocalised paths (api, og,
 * admin, .ics files) pass through untouched.
 */
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocalePath } from "./LangProvider";

type Props = ComponentProps<typeof NextLink>;

export default function Link({ href, ...rest }: Props) {
  const lp = useLocalePath();
  const h = typeof href === "string" ? lp(href) : href.pathname ? { ...href, pathname: lp(href.pathname) } : href;
  return <NextLink href={h} {...rest} />;
}
