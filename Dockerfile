# Production image for Railway (same shape as CamboMath, see docs/RAILWAY.md):
# one container, one volume at /app/data, one replica, tini as PID 1.
FROM node:22-bookworm-slim

# NEXT_MANUAL_SIG_HANDLE: let lib/shutdown.ts checkpoint the WAL on SIGTERM
# instead of Next exiting first. TZ is informational only; every date
# calculation passes explicit zones.
ENV NODE_ENV=production \
    NEXT_MANUAL_SIG_HANDLE=1 \
    NEXT_TELEMETRY_DISABLED=1

# tini reaps orphans; build tools only in case better-sqlite3 has no prebuilt binary.
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini build-essential python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci

COPY . .

# Every NEXT_PUBLIC_* value is inlined at BUILD time, so Railway must pass it
# as a build argument. A variable missing here silently does nothing in production.
ARG NEXT_PUBLIC_SITE_URL=""
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION=""
ARG NEXT_PUBLIC_ADSENSE_ACCOUNT=""
ARG NEXT_PUBLIC_AD_CLIENT_ID=""
ARG NEXT_PUBLIC_AD_SLOT_AFTER_READING=""
ARG NEXT_PUBLIC_AD_SLOT_IN_CONTENT=""
ARG NEXT_PUBLIC_AD_SLOT_RAIL=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_PUBLIC_BING_SITE_VERIFICATION=$NEXT_PUBLIC_BING_SITE_VERIFICATION \
    NEXT_PUBLIC_ADSENSE_ACCOUNT=$NEXT_PUBLIC_ADSENSE_ACCOUNT \
    NEXT_PUBLIC_AD_CLIENT_ID=$NEXT_PUBLIC_AD_CLIENT_ID \
    NEXT_PUBLIC_AD_SLOT_AFTER_READING=$NEXT_PUBLIC_AD_SLOT_AFTER_READING \
    NEXT_PUBLIC_AD_SLOT_IN_CONTENT=$NEXT_PUBLIC_AD_SLOT_IN_CONTENT \
    NEXT_PUBLIC_AD_SLOT_RAIL=$NEXT_PUBLIC_AD_SLOT_RAIL

RUN npm run build && rm -rf .next/cache && npm prune --omit=dev

# The volume mounts here. Nothing else on disk survives a deploy.
RUN mkdir -p /app/data
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start"]
