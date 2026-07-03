import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*Test.js'],
    setupFiles: ['tests/setupTestDatabaseEnv.js'],
    globalTeardown: ['tests/teardownTestDatabase.js']
  }
});
