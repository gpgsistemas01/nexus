import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*Test.js'],
        exclude: ['tests/integration/**'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
            reportsDirectory: 'coverage/unit',
            reportOnFailure: true
        }
    }
});
