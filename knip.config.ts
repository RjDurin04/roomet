import type { KnipConfig } from "knip";

// =============================================================================
// TIER 1 PIPELINE ENFORCEMENT — Dead Code Detection
// Finds: unused exports, unresolved imports, unused dependencies in package.json
// Runs in lefthook pre-push to prevent AI-generated dead code from accumulating.
// =============================================================================

const config: KnipConfig = {
  entry: [
    "src/App.tsx",
    "convex/**/*.ts",
    "src/components/ui/**/*.tsx",
    "src/features/boarding-house/index.ts",
    "src/features/map/index.ts"
  ],
  project: ["src/**/*.{ts,tsx}", "convex/**/*.ts"],
  ignoreDependencies: [
    "@fontsource-variable/geist",
    "shadcn",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "tw-animate-css"
  ],
  ignoreBinaries: [
    "gitleaks"
  ],
  ignoreExportsUsedInFile: true
};

export default config;
