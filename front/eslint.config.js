import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

const functionStatement = {
    selector: [
        'VariableDeclaration[declarations.0.init.type="ArrowFunctionExpression"]',
        'ExportNamedDeclaration[declaration.declarations.0.init.type="ArrowFunctionExpression"]',
    ].join(', '),
};

export default tseslint.config(
    { ignores: ['dist/**', 'coverage/**', 'build/**', 'test-results/**', 'node_modules/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    prettier,
    {
        files: ['src/**/*.{ts,vue}'],
        languageOptions: { globals: globals.browser },
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'any', prev: 'import', next: 'import' },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['function', 'block-like', functionStatement],
                },
                {
                    blankLine: 'always',
                    prev: ['function', 'block-like', functionStatement],
                    next: '*',
                },
                { blankLine: 'always', prev: 'if', next: '*' },
            ],
        },
    },
    {
        files: ['*.{js,ts}', 'tests/**/*.ts'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['tests/**/*.ts'],
        // Los arneses de composables crean componentes locales por caso de prueba.
        rules: { 'vue/one-component-per-file': 'off' },
    },
    {
        files: ['**/*.vue'],
        rules: {
            'vue/component-api-style': ['error', ['script-setup']],
            'vue/block-tag-newline': ['error', { singleline: 'always', multiline: 'always' }],
            'vue/padding-line-between-blocks': ['error', 'always'],
            'vue/define-macros-order': [
                'error',
                { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] },
            ],
        },
        languageOptions: {
            parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
        },
    },
    {
        files: ['src/**/components/**/*.vue'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                'axios',
                                'pinia',
                                'vee-validate',
                                '@nexus/login-validation',
                                '@nexus/api-messages',
                                '@nexus/form-validation',
                                '@nexus/waste-measurements',
                                '**/services/**',
                                '**/http/**',
                                '**/stores/**',
                                '**/pages/**',
                                '**/auth/session.js',
                            ],
                            message:
                                'La presentación recibe props y emite eventos; el contenedor coordina datos y operaciones.',
                        },
                    ],
                },
            ],
            'no-restricted-globals': [
                'error',
                {
                    name: 'fetch',
                    message: 'Las solicitudes HTTP pertenecen a servicios.',
                },
                {
                    name: 'XMLHttpRequest',
                    message: 'Las solicitudes HTTP pertenecen a servicios.',
                },
                {
                    name: 'localStorage',
                    message: 'La persistencia se coordina fuera de la presentación.',
                },
                {
                    name: 'sessionStorage',
                    message: 'La persistencia se coordina fuera de la presentación.',
                },
            ],
            'no-restricted-properties': [
                'error',
                ...['window', 'globalThis'].flatMap((object) =>
                    ['fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage'].map(
                        (property) => ({
                            object,
                            property,
                            message:
                                'HTTP y persistencia se coordinan fuera de los componentes de presentación.',
                        }),
                    ),
                ),
            ],
        },
    },
);
