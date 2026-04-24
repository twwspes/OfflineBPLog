import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import _import from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value: unknown) =>
    JSON.parse(JSON.stringify(value));
}

const AbortSignalCtor = globalThis.AbortSignal as
  | typeof AbortSignal
  | undefined;
if (
  AbortSignalCtor &&
  typeof AbortSignalCtor.prototype.throwIfAborted !== 'function'
) {
  AbortSignalCtor.prototype.throwIfAborted = function throwIfAborted() {
    if (this.aborted) {
      throw this.reason ?? new Error('The operation was aborted.');
    }
  };
}

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// eslint-disable-next-line import/no-default-export
export default [
  {
    ignores: [
      '**/jest.config.ts',
      '**/jest.setup.ts',
      '**/jest-svg-transformer.js',
      '**/jest-svg-transformer.ts',
      '**/node_modules',
      '**/tailwind.config.js',
      '**/vendor',
      '**/vite.config.ts',
      '**/cypress/**/*.js',
      '**/eslint.config.mjs',
      '**/.storybook/*',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:import/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:promise/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      'jsx-a11y': fixupPluginRules(jsxA11Y),
      react: fixupPluginRules(react),
      prettier: fixupPluginRules(prettier),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        project: [
          './tsconfig.json',
          './applications/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],

        tsconfigRootDir: dirname,
      },
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,

          project: [
            './tsconfig.json',
            './applications/*/tsconfig.json',
            './packages/*/tsconfig.json',
          ],
        },
      },

      react: {
        version: 'detect',
      },
    },

    rules: {
      'react/require-default-props': 'off',
      'class-methods-use-this': 'off',
      'import/no-default-export': 'error',
      'import/prefer-default-export': 'off',
      'react/no-unused-prop-types': 'off',
      'import/no-unresolved': 'error',

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.*',
            '**/*.stories.*',
            '**/*.spec.*',
            '**/test-utils/**',
            '**/__test__/**',
            '**/__tests__/**',
            'jest.setup.ts',
            '**/vite.config.ts',
            '**/tests/**/*',
            'eslint.config.mjs',
            'eslint.config.mts',
          ],
        },
      ],

      'jsx-a11y/label-has-associated-control': [
        2,
        {
          labelComponents: [],
          labelAttributes: [],
          controlComponents: [],
          assert: 'either',
          depth: 4,
        },
      ],

      'react/jsx-props-no-spreading': 'off',

      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state'],
        },
      ],

      'import/extensions': [
        'error',
        {
          js: 'never',
          ts: 'never',
          tsx: 'never',
          jsx: 'never',
          png: 'always',
          svg: 'always',
          json: 'always',
          jpg: 'always',
          scss: 'always',
          css: 'always',
          sass: 'always',
        },
      ],

      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],

      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'no-void': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/__tests__/*', '**/*.test.*', '**/*.spec.*'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],

    rules: {
      'import/no-default-export': 'off',
    },
  },
];
