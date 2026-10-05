import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // A leading underscore marks a parameter kept on purpose for existing callers (lib/i18n.ts).
  { rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }] } },
  // CommonJS hook scripts (.claude/hooks) have no ESM form of require().
  { files: ["**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/worktrees/**", "data/**"]),
]);

export default eslintConfig;
