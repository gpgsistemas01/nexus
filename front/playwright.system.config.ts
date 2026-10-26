import { randomUUID } from 'node:crypto';
import { defineConfig } from '@playwright/test';
import { requireSystemTestDatabase } from './tests/system/environment.js';

requireSystemTestDatabase();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_ACCESS ??= randomUUID();
process.env.JWT_SECRET_REFRESH ??= randomUUID();
process.env.JWT_SECRET_ONE_TIME ??= randomUUID();

export default defineConfig({
    testDir: './tests/system',
    globalSetup: './tests/system/setup.ts',
    workers: 1,
    fullyParallel: false,
    reporter: [['list'], ['junit', { outputFile: 'build/test-results/system.xml' }]],
    use: {
        baseURL: 'http://127.0.0.1:5175',
        headless: true,
        trace: 'retain-on-failure',
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
            : {},
    },
    webServer: [
        {
            command: 'node src/app.js',
            cwd: '../back',
            url: 'http://127.0.0.1:3107/inicio-sesion',
            env: { PORT: '3107', NODE_ENV: 'test' },
            reuseExistingServer: false,
        },
        {
            command: 'npm run dev -- --port 5175 --strictPort',
            url: 'http://127.0.0.1:5175',
            env: { BACKEND_PROXY_TARGET: 'http://127.0.0.1:3107' },
            reuseExistingServer: false,
        },
    ],
});
