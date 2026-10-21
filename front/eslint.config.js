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
                    group: [
                        'axios', 'pinia', 'vee-validate',
                        '@nexus/login-validation', '@nexus/api-messages', '@nexus/warehouse-validation', '@nexus/waste-measurements',
                        '**/services/**', '**/http/**', '**/stores/**', '**/pages/**', '**/auth/session.js',
                    ],
                    message: 'La presentación recibe props y emite eventos; el contenedor coordina datos y operaciones.',
                }],
            }],
            'no-restricted-globals': ['error', {
                name: 'fetch', message: 'Las solicitudes HTTP pertenecen a servicios.',
            }, {
                name: 'XMLHttpRequest', message: 'Las solicitudes HTTP pertenecen a servicios.',
            }, {
                name: 'localStorage', message: 'La persistencia se coordina fuera de la presentación.',
            }, {
                name: 'sessionStorage', message: 'La persistencia se coordina fuera de la presentación.',
            }],
            'no-restricted-properties': ['error', ...['window', 'globalThis'].flatMap(object =>
                ['fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage'].map(property => ({
                    object, property,
                    message: 'HTTP y persistencia se coordinan fuera de los componentes de presentación.',
                }))
            )],
        },
    },
);
