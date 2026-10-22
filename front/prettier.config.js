export default {
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    printWidth: 100,
    singleAttributePerLine: true,
    endOfLine: 'lf',
    overrides: [{ files: ['tests/**/*.ts', 'package.json'], options: { tabWidth: 2 } }],
};
