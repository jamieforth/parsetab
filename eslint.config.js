import globals from 'globals';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      'wrap-regex': 'error',
      '@stylistic/indent-binary-ops': 'off',
    },
  },
];
