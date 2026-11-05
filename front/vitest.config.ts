import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default defineConfig((env) =>
    mergeConfig(viteConfig(env), {
        test: {
            environment: 'jsdom',
            include: ['tests/**/*Test.ts'],
            setupFiles: ['tests/setup.ts'],
            clearMocks: true,
            maxWorkers: 2,
        },
    }),
);
