// Free space on the data volume. Ported unchanged in logic from CamboMath.
//
// Everything written at runtime lives under `data/`, which in production is ONE
// mounted volume of a fixed size (docs/RAILWAY.md): the SQLite file, its WAL
// and the daily backups. A volume that fills does not fail in one clean place.
// CamboMath's lesson (2026-09-19): its volume reached 495 MB of 500 MB; the running
// process kept serving, and the NEXT restart could not reopen the database
// ("disk I/O error"), so `instrumentation.ts` refused to boot and the whole
// site was down until someone freed space by hand.
//
// The database is the one thing that must never lose its headroom, because
// SQLite needs room for the WAL and a checkpoint just to OPEN. Backups are the
// thing that grows, so a new backup is what gets refused when space runs
// short — never the database.
//
// Directive-free and server-only by use (it needs `node:fs`); nothing on the
// client imports it.

import { existsSync, readFileSync, statfsSync } from "node:fs";
import path from "node:path";

/** The mount point in production (`/app/data`); `data/` under the repo in dev. */
export const DATA_DIR = path.join(process.cwd(), "data");

export const mb = (bytes: number) => Math.round(bytes / 1024 / 1024);

// ── Test seam ────────────────────────────────────────────────────────────────
// `DISK_TEST_STATFS="<totalMB>,<availMB>"` (or a file `data/.disk-test-statfs`
// holding the same) replaces the real `statfs` answer so the guard can be
// exercised end to end without filling a disk. IGNORED when NODE_ENV=production,
// exactly as R2_ENDPOINT is, so a stray variable can never fake a full or
// an empty volume on the live service.
function testStatfs(): { total: number; avail: number } | null {
  if (process.env.NODE_ENV === "production") return null;
  let raw = process.env.DISK_TEST_STATFS;
  if (!raw) {
    try {
      const f = path.join(DATA_DIR, ".disk-test-statfs");
      if (existsSync(f)) raw = readFileSync(f, "utf8");
    } catch {
      /* ignore */
    }
  }
  if (!raw) return null;
  const m = /^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/.exec(raw);
  if (!m) return null;
  return { total: Number(m[1]) * 1024 * 1024, avail: Number(m[2]) * 1024 * 1024 };
}

function readFs(dir: string): { total: number; avail: number } | null {
  const t = testStatfs();
  if (t) return t;
  try {
    const st = statfsSync(dir);
    const bsize = Number(st.bsize);
    const total = Number(st.blocks) * bsize;
    // bavail, not bfree: an unprivileged writer sees only bavail.
    const avail = Number(st.bavail) * bsize;
    if (!Number.isFinite(total) || !Number.isFinite(avail) || total <= 0) return null;
    return { total, avail };
  } catch {
    return null;
  }
}

/** Bytes free to an unprivileged writer on the filesystem holding `dir`, or
 *  `null` when the platform cannot answer — callers must treat `null` as
 *  "unknown, do not block", because refusing to work on a filesystem that does
 *  not report is a worse failure than the one being guarded. */
export function freeBytes(dir: string = DATA_DIR): number | null {
  return readFs(dir)?.avail ?? null;
}

/** Total size of the filesystem holding `dir`, or `null`. */
export function totalBytes(dir: string = DATA_DIR): number | null {
  return readFs(dir)?.total ?? null;
}

/**
 * The floor generated files must leave free, in bytes. `MIN_FREE_MB`,
 * default 50, never below 20.
 *
 * The default is 50 MB, not the 100 MB it was before the percent rule: on the
 * 500 MB production volume 100 MB free is 80% used, which would trip BEFORE the
 * 90% rule (and before the 80% warning), leaving no warn zone and making the
 * owner's percent rule unreachable. 50 MB is 10% of that volume — the same
 * point — so the floor and the percent agree there, and the floor only takes
 * over on a volume where 90% would still leave too little for SQLite to open
 * (a small disk). Raise it on a larger volume if you want more spare room.
 */
export function minFreeBytes(): number {
  const raw = Number(process.env.MIN_FREE_MB);
  const mbValue = Number.isFinite(raw) && raw > 0 ? Math.max(20, raw) : 50;
  return mbValue * 1024 * 1024;
}

function pctEnv(name: string, dflt: number, lo: number, hi: number): number {
  const raw = Number(process.env[name]);
  const v = Number.isFinite(raw) && raw > 0 ? raw : dflt;
  return Math.min(hi, Math.max(lo, v));
}

/** Used-percent at which generated files are refused. `DISK_BLOCK_PCT`, default
 *  90, clamped 50..98. */
export function blockPct(): number {
  return pctEnv("DISK_BLOCK_PCT", 90, 50, 98);
}

/** Used-percent at which the admin is warned. `DISK_WARN_PCT`, default 80,
 *  always kept below the block percent. */
export function warnPct(): number {
  const block = blockPct();
  return Math.min(pctEnv("DISK_WARN_PCT", 80, 40, 97), block - 1);
}

export type DiskLevel = "ok" | "warn" | "blocked" | "unknown";

export type DiskStatus = {
  totalBytes: number | null;
  usedBytes: number | null;
  freeBytes: number | null;
  /** 0..100, one decimal; null when `level` is "unknown". */
  usedPct: number | null;
  warnPct: number;
  blockPct: number;
  minFreeBytes: number;
  level: DiskLevel;
  /** Which limit tripped a "blocked": the percent rule or the free-bytes floor. */
  reason: "percent" | "floor" | null;
};

/** Pure classification — exported so the rule can be tested without a disk. */
export function classifyDisk(
  total: number | null,
  avail: number | null,
  incomingBytes = 0
): DiskStatus {
  const base = { warnPct: warnPct(), blockPct: blockPct(), minFreeBytes: minFreeBytes() };
  if (total === null || avail === null || total <= 0) {
    return { totalBytes: null, usedBytes: null, freeBytes: null, usedPct: null, ...base, level: "unknown", reason: null };
  }
  const used = Math.max(0, total - avail);
  const usedPct = Math.round((used / total) * 1000) / 10;
  const incoming = Math.max(0, incomingBytes || 0);
  const afterPct = ((used + incoming) / total) * 100;
  const afterFree = avail - incoming;
  let level: DiskLevel = "ok";
  let reason: DiskStatus["reason"] = null;
  if (afterPct >= base.blockPct) {
    level = "blocked";
    reason = "percent";
  } else if (afterFree < base.minFreeBytes) {
    level = "blocked";
    reason = "floor";
  } else if (afterPct >= base.warnPct) {
    level = "warn";
  }
  return { totalBytes: total, usedBytes: used, freeBytes: avail, usedPct, ...base, level, reason };
}

// A short TTL so hot paths (a sweep's per-item loop, every upload) do not
// `statfs` each call. A statfs is one cheap syscall, but there is no reason to
// pay it thousands of times; five seconds is far inside the time it takes to
// fill the headroom above the block line (tens of MB) with admin-driven writes.
const TTL_MS = 5_000;
let cache: { at: number; dir: string; total: number | null; avail: number | null } | null = null;

/** Drops the cached reading. For tests, and for a caller that just freed space. */
export function resetDiskCache(): void {
  cache = null;
}

/**
 * ONE snapshot of the data volume, cached for a few seconds.
 * `incomingBytes` (optional) is what the caller is ABOUT to add: the level is
 * computed as if those bytes were already written, so a write that would cross
 * the block line is refused before it starts. `fresh: true` bypasses the cache.
 * Never throws; `level: "unknown"` (statfs unsupported) never blocks.
 */
export function diskStatus(opts: { incomingBytes?: number; fresh?: boolean; dir?: string } = {}): DiskStatus {
  const dir = opts.dir ?? DATA_DIR;
  const now = Date.now();
  if (opts.fresh || !cache || cache.dir !== dir || now - cache.at > TTL_MS || now < cache.at) {
    const r = readFs(dir);
    cache = { at: now, dir, total: r?.total ?? null, avail: r?.avail ?? null };
  }
  return classifyDisk(cache.total, cache.avail, opts.incomingBytes ?? 0);
}

/** Thrown, and only thrown, when generated files must stop to protect the
 *  database. Its message is safe to show an admin: sizes and percentages only,
 *  no paths. */
export class VolumeLowError extends Error {
  readonly status: DiskStatus;
  constructor(what: string, status: DiskStatus) {
    const free = status.freeBytes === null ? "?" : String(mb(status.freeBytes));
    super(
      `Disk is ${status.usedPct}% full (${free} MB free) — writes are blocked at ${status.blockPct}% ` +
        `so the site and database keep running. Cannot write ${what}. Free space by deleting ` +
        `old backups or growing the volume.`
    );
    this.name = "VolumeLowError";
    this.status = status;
  }
}

/** Refuse BEFORE writing new bytes under data/ when the volume is at or past the
 *  block line (or the write would take it there). A no-op when the disk cannot
 *  be read. */
export function assertWriteHeadroom(
  what: string,
  opts: { incomingBytes?: number; fresh?: boolean; dir?: string } = {}
): void {
  const s = diskStatus(opts);
  if (s.level === "blocked") throw new VolumeLowError(what, s);
}

/** Non-throwing form: the blocking status, or null when the write may proceed. */
export function diskBlock(opts: { incomingBytes?: number; fresh?: boolean; dir?: string } = {}): DiskStatus | null {
  const s = diskStatus(opts);
  return s.level === "blocked" ? s : null;
}

/** Rough sizes callers use for `incomingBytes` when the real size is unknown. */
