/**
 * Graceful shutdown (CamboMath lib/shutdown.ts): on SIGTERM/SIGINT fold the
 * WAL into the database and close it, so the file on the volume is the whole
 * database after every redeploy. Requires NEXT_MANUAL_SIG_HANDLE=1 (set in the
 * Dockerfile); without it Next exits first and this never finishes.
 */
import { closeDb } from "./db";

let stopping = false;

function shutdown(signal: string): void {
  if (stopping) return;
  stopping = true;
  console.log(`[shutdown] ${signal}: checkpointing and closing the database`);
  try { closeDb(); } catch (err) { console.error("[shutdown] close failed", err); }
  process.exit(0);
}

export function registerShutdownHandlers(): void {
  const store = globalThis as unknown as { __alShutdown?: boolean };
  if (store.__alShutdown) return;
  store.__alShutdown = true;
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_MANUAL_SIG_HANDLE) {
    console.warn("[shutdown] NEXT_MANUAL_SIG_HANDLE is not set; a redeploy may leave the WAL uncheckpointed. The Dockerfile sets it.");
  }
  for (const s of ["SIGTERM", "SIGINT"] as const) process.on(s, () => shutdown(s));
}
