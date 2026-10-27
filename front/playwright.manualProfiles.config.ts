import { defineConfig } from '@playwright/test';

const mode = process.env.FRONT_MANUAL_MODE ?? 'demo';
const baseURL = process.env.FRONT_MANUAL_BASE_URL ?? 'http://127.0.0.1:5177';

export default defineConfig({
    testDir: './tests/manual-profiles',
    fullyParallel: false,
    workers: 1,
    timeout: 180_000,
    reporter: [['list'], ['junit', { outputFile: 'build/test-results/manual-profiles.xml' }]],
    use: {
        baseURL,
        viewport: { width: 1600, height: 1400 },
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        headless: true,
        trace: 'off',
        screenshot: 'off',
        video: 'off',
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
            : {},
    },
    webServer:
        mode === 'demo'
            ? {
                  command: 'npm run dev -- --port 5177',
                  url: baseURL,
                  reuseExistingServer: false,
                  timeout: 60_000,
              }
            : undefined,
});
