// =============================================================================
// TIER 1 PIPELINE ENFORCEMENT — Production ESLint Config
// Adapted for bhouse frontend project structure
// =============================================================================

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import securityPlugin from 'eslint-plugin-security'
import boundariesPlugin from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'convex/_generated']),

  // ─── Main source rules ────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
      security: securityPlugin,
      boundaries: boundariesPlugin,
    },
    rules: {
      // ── STYLE / STRUCTURE ─────────────────────────────────────────────────
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'max-depth': ['error', 4],
      'no-magic-numbers': ['error', { ignore: [0, 1, -1, 2], ignoreArrayIndexes: true, enforceConst: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': ['error', { props: true }],
      complexity: ['error', 15],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'no-else-return': ['error', { allowElseIf: false }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
      ],
      'no-warning-comments': ['warn', { terms: ['TODO', 'FIXME', 'HACK', 'XXX'] }],

      // ── TYPE SAFETY ───────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // ── ASYNC / PROMISE CORRECTNESS ───────────────────────────────────────
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/require-await': 'error',

      // ── MODERN JS CORRECTNESS ─────────────────────────────────────────────
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],

      // ── SECURITY ──────────────────────────────────────────────────────────
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-fs-filename': 'error',

      // ── REACT HOOKS ───────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── ARCHITECTURE BOUNDARIES ───────────────────────────────────────────
      // Adapted for bhouse project structure (features, components, lib, services)
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'ui', allow: ['ui', 'features', 'lib', 'contexts'] },
            { from: 'features', allow: ['features', 'lib', 'contexts', 'services'] },
            { from: 'services', allow: ['services', 'lib'] },
            { from: 'lib', allow: ['lib'] },
            { from: 'contexts', allow: ['contexts', 'lib'] },
          ],
        },
      ],

      // ── Pragmatic relaxations for React ───────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
    settings: {
      'boundaries/elements': [
        { type: 'ui', pattern: 'src/components/*' },
        { type: 'features', pattern: 'src/features/*' },
        { type: 'services', pattern: 'src/services/*' },
        { type: 'lib', pattern: 'src/lib/*' },
        { type: 'contexts', pattern: 'src/contexts/*' },
      ],
    },
  },

  // ─── Convex backend functions ─────────────────────────────────────────────
  {
    files: ['convex/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
      security: securityPlugin,
    },
    rules: {
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'security/detect-object-injection': 'warn',
    },
  },

  // ─── Test overrides ───────────────────────────────────────────────────────
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'security/detect-object-injection': 'off',
    },
  },
])
