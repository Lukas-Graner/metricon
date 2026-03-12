import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...svelte.configs['flat/recommended'],

  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  {
    files: ['**/*.svelte.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
  },

  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
];