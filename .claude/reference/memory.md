# Session memory

The memory for this repo is committed, because cloud sessions start in a fresh container where nothing outside git survives:

- `.claude/memory/MEMORY.md` — lessons that cost time. Auto-loaded (imported by CLAUDE.md); keep it under 3 KB.
- `.claude/memory/sessions.md` — one short entry per session (what changed, what is open). Read on demand.
- `.claude/hooks/session-start.sh` — at the start of a cloud session installs dependencies if missing and prints the branch, recent commits, uncommitted files and the doc-size budget, so a session does not spend tool calls rediscovering them.

If the user-scoped `claude-mem` plugin is available (CamboMath uses it: `prime_corpus`, then `query_corpus`), it can answer "why was this done?" from recorded sessions; it is an addition to the committed memory, never a replacement.
