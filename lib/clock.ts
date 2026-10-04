/** The current instant. One seam for "now" so render code stays pure and tests can pin time. */
export const nowIso = (): string => new Date().toISOString();
