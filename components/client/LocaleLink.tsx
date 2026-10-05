"use client";
/**
 * next/link, kept as the site's link component so call sites need not change.
 * The site is English only (2026-10-05): nothing is prefixed any more.
 */
import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} />;
}
