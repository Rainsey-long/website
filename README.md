# Almanac — daily horoscopes, Chinese zodiac, Khmer traditions

A calm, minimalist horoscope and almanac site. Western astrology, the Chinese zodiac and almanac, and the Khmer traditional calendar, side by side, with the visitor choosing which traditions they see. Readings come from the real sky and hand-written text; nothing is generated at runtime.

Same stack and production shape as CamboMath: **Next.js 16 + better-sqlite3 on Railway (one container, one volume, one replica), domain on Cloudflare.**

```bash
npm install
cp .env.example .env.local     # set AUTH_SECRET and ADMIN_PASSWORD
npm run dev                    # http://localhost:3000, admin at /admin/login
npm test                       # engine tests
npm run release:check          # all gates, GO / NO-GO
```

Start with **CLAUDE.md** (and its imports) and **DESIGN_SYSTEM.md** (binding for UI). Deploying: **docs/RAILWAY.md**. Waiting on the owner: **docs/OWNER-ACTIONS.md**.

| Where | What |
|---|---|
| `app/` | pages and API routes |
| `components/` | UI (server), `components/client/` interactive islands |
| `lib/` | engines: `western`, `sky`, `skyEvents`, `reading-engine`, `chinese`, `almanac`, `khmer`, `compatibility`, `calculator`; server: `db`, `auth`, `seed`, `backup` |
| `content/` | reading blocks, profiles, 2027 forecasts |
| `app/styles/tokens.css` | the only place raw design values live |
| `docs/research/` | Khmer traditions research, feature research and scored brainstorm |
