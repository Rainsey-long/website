// Known AI/LLM-training and AI-answer-engine crawler user-agent identifiers.
// Shared by app/robots.ts (the polite, declarative Disallow a well-behaved
// bot checks before its first request) and proxy.ts (the enforced 403 for
// anything that ignores robots.txt) so the two layers can never silently
// drift into two different lists.
//
// Deliberately does NOT include regular search-engine crawlers (Googlebot,
// Bingbot, DuckDuckBot, ...) or SEO/marketing crawlers (AhrefsBot,
// SemrushBot, ...) — blocking those would hurt this site's own
// discoverability, which isn't the goal here. This list is AI-training/
// AI-answer-engine bots specifically.
//
// This is a named-entity list, not a mechanism — new AI crawlers appear
// over time and this needs the same kind of periodic re-check any other
// blocklist does. It's also UA-string matching only: a scraper that lies
// about its identity isn't caught by this (the same limitation robots.txt
// itself has always had) — this stops the honest-but-unwanted majority, not
// a determined, spoofing-capable adversary.
//
// LAST REFRESHED 2026-08-14, against the ai.robots.txt community reference.
// The previous list was written before the 2025-2026 wave of agentic
// "user-triggered" fetchers and scraping-as-a-service tools, and had gone
// materially stale: an audit measured 80 current AI crawler tokens passing
// straight through, including Anthropic's own newer agents — `ClaudeBot` was
// blocked while `Claude-User` and `Claude-SearchBot` were not, because those
// are separate tokens that contain no blocked substring.
//
// MATCHING IS UNANCHORED, CASE-INSENSITIVE SUBSTRING — so a token added here
// carelessly can silently block traffic this site depends on. Before adding
// one, check it is not a substring of a legitimate agent's UA:
//   - `SemrushBot-OCOB` is safe; a bare `SemrushBot` would wrongly block the
//     general SEO crawler this file deliberately allows.
//   - `DuckAssistBot` is safe; it is not a substring of `DuckDuckBot`.
//   - `Applebot-Extended` is safe; plain `Applebot` (search) must stay allowed.
//   - Generic English words (`Operator`, `Agent`) are deliberately NOT used as
//     standalone tokens, however real the crawler, because they will match
//     unrelated user-agents.
// Search, social-preview and SEO crawlers stay allowed by design — verified
// still-passing after this refresh: Googlebot, Mediapartners-Google,
// AdsBot-Google, bingbot, DuckDuckBot, Applebot, facebookexternalhit,
// Twitterbot, Slackbot, TelegramBot, WhatsApp.
export const AI_BOT_USER_AGENTS = [
  // ── OpenAI ──
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // ── Anthropic ──
  "ClaudeBot",
  "Claude-Web",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // ── Google (AI surfaces only — Googlebot/AdsBot stay allowed) ──
  "Google-Extended",
  "Google-CloudVertexBot",
  "NotebookLM",
  // ── Apple / Meta / Amazon / ByteDance ──
  "Applebot-Extended",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Amazonbot",
  "Bytespider",
  "TikTokSpider",
  // ── Other model developers ──
  "PerplexityBot",
  "Perplexity-User",
  "MistralAI-User",
  "DeepSeekBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "AI2Bot",
  "PanguBot",
  "YouBot",
  "DuckAssistBot",
  "Kangaroo Bot",
  // ── Dataset / crawl aggregators ──
  "CCBot",
  "Diffbot",
  "Omgili",
  "ImagesiftBot",
  "Timpibot",
  "Webzio-Extended",
  "img2dataset",
  "SemrushBot-OCOB",
  "SemrushBot-SWA",
  // ── Scraping-as-a-service / agent tooling ──
  "FirecrawlAgent",
  "Crawl4AI",
  "ApifyBot",
  "ExaBot",
  "TavilyBot",
] as const;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const AI_BOT_UA_PATTERN = new RegExp(
  AI_BOT_USER_AGENTS.map(escapeRegExp).join("|"),
  "i"
);
