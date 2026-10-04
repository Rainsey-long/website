/**
 * Owner-edited Markdown reaches public pages, so the renderer must neutralise
 * HTML and unsafe links, and an edit must keep the shape the pages read.
 */
import { describe, expect, it } from "vitest";
import { parseSource, repoSource, CONTENT_PATHS } from "../lib/content";
import { validateContent } from "../lib/contentAdmin";

describe("admin Markdown rendering", () => {
  it("shows raw HTML as text and drops unsafe links", () => {
    const { html } = parseSource("---\nname: x\n---\n\nHi <script>alert(1)</script> <img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1)) [ok](/zodiac/aries) [web](https://example.org)\n\n![pic](https://evil.example/x.png)");
    expect(html).not.toMatch(/<script|<img|href="javascript:/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain('<a href="/zodiac/aries">ok</a>');
    expect(html).toContain('<a href="https://example.org">web</a>');
    expect(html).toContain("bad");
  });
});

describe("admin content validation", () => {
  const path = "profiles/western/aries.md";
  const original = repoSource(path, "en")!;
  it("accepts the original file unchanged", () => {
    expect(CONTENT_PATHS).toHaveLength(36);
    expect(validateContent(path, "en", original)).toBeNull();
  });
  it("refuses a changed slug, broken YAML and a missing body", () => {
    expect(validateContent(path, "en", original.replace("slug: aries", "slug: leo"))).toMatch(/slug/);
    expect(validateContent(path, "en", "---\nname: [unclosed\n---\n" + "x".repeat(80))).toMatch(/YAML/);
    expect(validateContent(path, "en", original.split("---").slice(0, 2).join("---") + "---\n\nshort")).toMatch(/missing or too short/);
  });
  it("keeps machine-read forecast keys", () => {
    const f = "yearly/2027/rat.md";
    const src = repoSource(f, "en")!;
    expect(validateContent(f, "en", src)).toBeNull();
    expect(validateContent(f, "km", src.replace(/outlook: \d/, "outlook: 5"))).toMatch(/outlook/);
  });
});
