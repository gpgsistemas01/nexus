import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*Test.js'],
    setupFiles: ['tests/setupIntegrationTestDatabase.js'],
    globalTeardown: ['tests/teardownTestDatabase.js'],
    fileParallelism: false
  }
});
