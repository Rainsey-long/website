# Session memory

CamboMath uses the user-scoped `claude-mem` plugin (corpora queried with `prime_corpus` then `query_corpus`) to answer "why was this done?" from recorded sessions instead of grepping a huge history file. Nothing in this repo configures it; if the plugin is available in a session, the same approach applies here.

Until a corpus exists for this repo, the memory is written down: `DECISIONS.md` (why a convention), `.claude/system-state.md` (what is true now), commit messages (the why behind each change), and `docs/research/` (what was researched and rejected). Prefer adding a line to one of those over relying on any session's memory.
