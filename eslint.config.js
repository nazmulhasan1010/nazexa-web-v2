import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'dist/**', 'next-env.d.ts'],
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],

    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },

    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  prettierConfig,
];
