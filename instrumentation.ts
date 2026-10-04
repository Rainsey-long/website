/**
 * Boot checks (CamboMath instrumentation.ts pattern). The process refuses to
 * start in production when a mistake would otherwise surface later as a
 * mystery: missing AUTH_SECRET, a serverless host (the database is a file on
 * a volume), or an admin still using the development password.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registerShutdownHandlers } = await import("./lib/shutdown");
  registerShutdownHandlers();
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const fatal: string[] = [];
  const warn: string[] = [];
  for (const v of ["VERCEL", "NETLIFY", "AWS_LAMBDA_FUNCTION_NAME", "K_SERVICE", "FUNCTIONS_WORKER_RUNTIME", "CF_PAGES"]) {
    if (process.env[v]) fatal.push(`${v} is set: this app needs a persistent volume and one long-running process (Railway, see docs/RAILWAY.md).`);
  }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) fatal.push("AUTH_SECRET must be set to at least 16 characters (32+ recommended).");
  if (!process.env.NEXT_PUBLIC_SITE_URL) warn.push("NEXT_PUBLIC_SITE_URL is not set in the BUILD environment; canonicals and share links use the placeholder domain.");
  if (!process.env.BACKUP_SECRET) warn.push("BACKUP_SECRET is not set; /api/cron/backup answers 503 and no backups are taken.");
  const hops = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "0", 10) || 0;
  if (hops < 1) warn.push("TRUSTED_PROXY_HOPS is 0; per-caller rate limits key on a header fingerprint. On Railway set it to 1 (2 with Cloudflare proxying in front).");

  if (!fatal.length) {
    try {
      const { getDb } = await import("./lib/db");
      const { verifyPassword } = await import("./lib/auth");
      const { DEV_ADMIN_PASSWORD } = await import("./lib/seed");
      const rows = getDb().prepare("SELECT username, password_hash FROM users").all() as Array<{ username: string; password_hash: string }>;
      const weak = rows.filter((r) => verifyPassword(DEV_ADMIN_PASSWORD, r.password_hash)).map((r) => r.username);
      if (weak.length) fatal.push(`Admin account(s) ${weak.join(", ")} still use the development password. Never copy a development database onto the production volume.`);
      const { diskStatus } = await import("./lib/volumeHeadroom");
      const d = diskStatus({ fresh: true });
      if (d.level === "blocked" || d.level === "warn") warn.push(`Data volume is ${d.level}: ${JSON.stringify(d)}`);
    } catch (err) {
      fatal.push(`Database check failed: ${String(err)}`);
    }
  }
  for (const w of warn) console.warn(`[boot] ${w}`);
  if (fatal.length) {
    for (const f of fatal) console.error(`[boot] ${f}`);
    throw new Error("Refusing to start (see [boot] errors above).");
  }
}
