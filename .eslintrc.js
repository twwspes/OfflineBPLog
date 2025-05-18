module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: [
      './tsconfig.json',
      './applications/*/tsconfig.json',
      './packages/*/tsconfig.json',
    ],
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'import',
    'jsx-a11y',
    'react',
    'react-hooks',
    'prettier',
    '@typescript-eslint',
  ],
  rules: {
    eqeqeq: [
      'error',
      'always',
      {
        null: 'always',
      },
    ],
    'import/no-default-export': 'error',

    'import/prefer-default-export': 'off',

    'no-void': 'off',

    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    'react/jsx-props-no-spreading': 'off',

    'react/no-array-index-key': 'off',

    // These don't work very well with TS.
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
    react: {
      version: 'detect',
    },
  },
};
