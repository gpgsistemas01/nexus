import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'build/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.{js,ts}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
  },
  {
    files: ['src/**/components/**/*.vue'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['axios', 'pinia', '**/services/**', '**/http/**', '**/stores/**', '**/pages/**'],
          message: 'La presentación recibe props y emite eventos; el contenedor coordina datos y operaciones.',
        }],
      }],
    },
  },
);
