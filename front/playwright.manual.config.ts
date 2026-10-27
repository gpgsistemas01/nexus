import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/manual',
    fullyParallel: false,
    workers: 1,
    timeout: 60_000,
    reporter: [['list'], ['junit', { outputFile: 'build/test-results/manual.xml' }]],
    use: {
        baseURL: 'http://127.0.0.1:5176',
        viewport: { width: 1440, height: 1100 },
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        headless: true,
        trace: 'retain-on-failure',
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
            : {},
    },
    webServer: {
        command: 'npm run dev -- --port 5176',
        url: 'http://127.0.0.1:5176',
        reuseExistingServer: false,
        timeout: 60_000,
    },
});
