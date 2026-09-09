import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';

const require = createRequire(import.meta.url);
const baseURL = new URL(process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000');
const screenshotArguments = process.argv.slice(2);
const startupTimeout = 30000;
const retryDelay = 500;
const npmCommand = process.env.npm_execpath
    ? process.execPath
    : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
const npmArguments = process.env.npm_execpath ? [process.env.npm_execpath] : [];

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const runCommand = (command, argumentsList, description) => new Promise((resolve, reject) => {
    const childProcess = spawn(command, argumentsList, { stdio: 'inherit' });

    childProcess.once('error', reject);
    childProcess.once('exit', (code, signal) => {
        if (signal) reject(new Error(`${ description } terminó por la señal ${ signal }.`));
        else if (code === 0) resolve();
        else reject(new Error(`${ description } terminó con el código ${ code ?? 1 }.`));
    });
});

const isPlaywrightInstalled = () => {
    try {
        require.resolve('playwright');
        return true;
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') return false;
        throw error;
    }
};

const preparePlaywright = async () => {
    if (!isPlaywrightInstalled()) {
        console.log('Playwright no está instalado; se instalará temporalmente para generar las capturas.');
        await runCommand(
            npmCommand,
            [...npmArguments, 'install', '--no-save', '--package-lock=false', 'playwright'],
            'La instalación de Playwright'
        );
    }

    console.log('Comprobando la instalación de Chromium para Playwright.');
    await runCommand(
        npmCommand,
        [...npmArguments, 'exec', '--', 'playwright', 'install', 'chromium'],
        'La instalación de Chromium para Playwright'
    );
};

const isApplicationReady = async () => {
    try {
        const response = await fetch(new URL('/inicio-sesion', baseURL));
        return response.ok;
    } catch {
        return false;
    }
};

const runScreenshots = () => new Promise((resolve, reject) => {
    const captureProcess = spawn(
        process.execPath,
        ['scripts/captureManualScreenshots.js', ...screenshotArguments],
        { stdio: 'inherit' }
    );

    captureProcess.once('error', reject);
    captureProcess.once('exit', (code, signal) => {
        if (signal) reject(new Error(`El proceso de capturas terminó por la señal ${ signal }.`));
        else resolve(code ?? 1);
    });
});

const startApplication = () => {
    if (baseURL.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(baseURL.hostname)) {
        throw new Error(
            `No se puede iniciar Nexus automáticamente para DOCS_BASE_URL=${ baseURL.origin }. `
            + 'Inicie esa aplicación externamente o use una URL local HTTP.'
        );
    }

    const port = baseURL.port || '80';
    console.log(`Nexus no está disponible en ${ baseURL.origin }; iniciando una instancia temporal.`);
    return spawn(process.execPath, ['src/app.js'], {
        env: { ...process.env, PORT: port },
        stdio: 'inherit'
    });
};

const waitForApplication = async (applicationProcess) => {
    const deadline = Date.now() + startupTimeout;

    while (Date.now() < deadline) {
        if (applicationProcess.exitCode !== null) {
            throw new Error(`Nexus terminó antes de estar disponible (código ${ applicationProcess.exitCode }).`);
        }
        if (await isApplicationReady()) return;
        await delay(retryDelay);
    }

    throw new Error(`Nexus no respondió en ${ baseURL.origin } después de ${ startupTimeout / 1000 } segundos.`);
};

const stopApplication = async (applicationProcess) => {
    if (!applicationProcess || applicationProcess.exitCode !== null) return;

    applicationProcess.kill('SIGTERM');
    await new Promise(resolve => {
        const forceStopTimeout = setTimeout(() => {
            if (applicationProcess.exitCode === null) applicationProcess.kill('SIGKILL');
        }, 5000);
        applicationProcess.once('exit', () => {
            clearTimeout(forceStopTimeout);
            resolve();
        });
    });
    console.log('Instancia temporal de Nexus detenida.');
};

let applicationProcess;

try {
    if (!screenshotArguments.includes('--list')) await preparePlaywright();

    if (!screenshotArguments.includes('--list') && !await isApplicationReady()) {
        applicationProcess = startApplication();
        await waitForApplication(applicationProcess);
    } else if (!screenshotArguments.includes('--list')) {
        console.log(`Se reutilizará la instancia de Nexus disponible en ${ baseURL.origin }.`);
    }

    const exitCode = await runScreenshots();
    if (exitCode !== 0) process.exitCode = exitCode;
} finally {
    await stopApplication(applicationProcess);
}
