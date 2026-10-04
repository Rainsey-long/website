# This is NOT the Next.js you know

This version (16.3) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Already applied here, do not "fix" back: `params` is a Promise (always `await` it); `middleware.ts` is `proxy.ts` with a named `proxy` export; route files export only HTTP handlers; Turbopack is the bundler.
