/*
 * Service worker (FEATURES.md #48): installable app + offline "today".
 * Hand-written and deliberately small. Registered by
 * components/client/ServiceWorkerRegister.tsx in production only.
 *
 *  - Pages (navigations): network first. A successful HTML page is kept in a
 *    small cache (newest MAX_PAGES) so the last-visited pages open offline;
 *    with no network and no cached copy, the offline page (/offline or
 *    /km/offline) is shown.
 *  - Build assets (/_next/static/*, content-hashed and immutable): cache
 *    first, so a cached page still has its styles and fonts offline.
 *  - Never touched: anything that is not a same-origin GET, and /api/*,
 *    /admin, /km/admin, /og/*, /feeds/* (requests pass straight to the
 *    network; nothing from them is stored or served from cache).
 *
 * Bump VERSION to drop every cache on the next activation.
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const MAX_PAGES = 20;
const MAX_ASSETS = 80;
const OFFLINE = { en: "/offline", km: "/km/offline" };
const NEVER = /^\/(?:km\/)?(?:api|admin|og|feeds)(?:\/|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll([OFFLINE.en, OFFLINE.km])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  // Keys come back in insertion order; the offline pages are re-added on every install.
  for (const k of keys.slice(0, Math.max(0, keys.length - max))) {
    const p = new URL(k.url).pathname;
    if (p !== OFFLINE.en && p !== OFFLINE.km) await cache.delete(k);
  }
}

async function page(event) {
  const { request } = event;
  try {
    const res = await fetch(request);
    const html = (res.headers.get("content-type") || "").includes("text/html");
    // Not keyed on Cache-Control: every page here is dynamic and Next marks
    // them all no-store. What must never be stored is excluded by path (NEVER).
    if (res.ok && res.type === "basic" && !res.redirected && html) {
      // Stored in the background so a streamed page is not held back.
      const copy = res.clone();
      event.waitUntil(caches.open(PAGES).then(async (cache) => {
        await cache.delete(request); // re-insert so the newest page is last
        await cache.put(request, copy);
        await trim(PAGES, MAX_PAGES);
      }));
    }
    return res;
  } catch {
    const cached = await caches.match(request, { cacheName: PAGES });
    if (cached) return cached;
    // Redirect to the offline page's own URL rather than serving its HTML under
    // this one: the router sees the URL mismatch, navigates again and ends on
    // "page not found" (security review 2026-10-05). Only navigations redirect.
    const km = new URL(request.url).pathname.startsWith("/km");
    const offline = km ? OFFLINE.km : OFFLINE.en;
    if (request.mode === "navigate" && (await caches.match(offline, { cacheName: PAGES }))) {
      return Response.redirect(new URL(offline, self.location.origin).href, 302);
    }
    return Response.error();
  }
}

async function asset(request) {
  const cached = await caches.match(request, { cacheName: ASSETS });
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") {
    const cache = await caches.open(ASSETS);
    await cache.put(request, res.clone());
    trim(ASSETS, MAX_ASSETS);
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || NEVER.test(url.pathname)) return;
  if (request.mode === "navigate") event.respondWith(page(event));
  else if (url.pathname.startsWith("/_next/static/")) event.respondWith(asset(request));
});
