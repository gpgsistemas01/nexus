import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/integration/**/*Test.js'],
        setupFiles: ['tests/setupIntegrationTestDatabase.js'],
        globalTeardown: ['tests/teardownTestDatabase.js'],
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.js'],
            exclude: ['src/public/**'],
            reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
            reportsDirectory: 'coverage/integration',
            reportOnFailure: true
        }
    }
});
