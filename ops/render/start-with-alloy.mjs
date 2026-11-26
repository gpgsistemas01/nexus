import { spawn } from 'node:child_process';
import { createSocket } from 'node:dgram';
import { accessSync, constants, copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { setTimeout as wait } from 'node:timers/promises';

const launcherArgs = process.argv.slice(2);
const local = launcherArgs[0] === '--local';
const [command, ...args] = local ? launcherArgs.slice(1) : launcherArgs;
const alloyHttpAddress = local ? '127.0.0.1:15141' : '127.0.0.1:12345';
const token = process.env.GRAFANA_LOKI_TOKEN?.trim() ?? '';
const secretFile = process.env.GRAFANA_LOKI_TOKEN_FILE || '/etc/secrets/nexus-loki-token';
const environment = {
    GRAFANA_LOKI_HOST: process.env.GRAFANA_LOKI_HOST,
    GRAFANA_LOKI_USERNAME: process.env.GRAFANA_LOKI_USERNAME,
    GRAFANA_LOKI_TOKEN: token,
    GRAFANA_LOKI_TOKEN_FILE: token ? '' : secretFile,
    NEXUS_LOG_ENVIRONMENT: process.env.NEXUS_LOG_ENVIRONMENT ?? (local ? 'local' : 'production'),
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    GOMEMLIMIT: '96MiB',
    GOMAXPROCS: '1'
};
const syslogHeader = Buffer.from('<14>1 - - nexus-api - - - ');
const maxLogBytes = 16 * 1024;

let application;
let shutdownSignal;

const report = message => process.stderr.write(`[nexus-alloy] ${message}\n`);

for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        shutdownSignal ??= signal;
        application?.kill(signal);
    });
}

const startCollector = () => {
    if (!environment.GRAFANA_LOKI_HOST || !environment.GRAFANA_LOKI_USERNAME) {
        report('Falta el host de Loki o el ID de la instancia');
        return;
    }

    if (!token) {
        try {
            accessSync(secretFile, constants.R_OK);
        } catch {
            report('Configura GRAFANA_LOKI_TOKEN o indica un archivo de token legible');
            return;
        }
    }

    let configDirectory = '/app/alloy';
    let storageDirectory = '/tmp/nexus-alloy';
    if (local) {
        try {
            configDirectory = mkdtempSync(join(tmpdir(), 'nexus-alloy-'));
            const temporaryDirectory = configDirectory;
            process.once('exit', () => {
                try {
                    rmSync(temporaryDirectory, { recursive: true, force: true });
                } catch {
                    report('No se pudo limpiar el directorio temporal de Alloy');
                }
            });
            copyFileSync(new URL('./source.alloy', import.meta.url), join(configDirectory, 'source.alloy'));
            copyFileSync(new URL('../alloy/pipeline.alloy', import.meta.url), join(configDirectory, 'pipeline.alloy'));
            storageDirectory = join(configDirectory, 'data');
        } catch {
            report('No se pudo preparar la configuración local de Alloy');
            return;
        }
    }

    const windowsBinary = local && process.platform === 'win32' && process.env.ProgramFiles
        ? join(process.env.ProgramFiles, 'GrafanaLabs', 'Alloy', 'alloy-windows-amd64.exe')
        : undefined;
    const defaultLocalBinary = windowsBinary && existsSync(windowsBinary) ? windowsBinary : 'alloy';
    const binary = local ? (process.env.NEXUS_ALLOY_BIN?.trim() || defaultLocalBinary) : '/usr/local/bin/alloy';
    const child = spawn(binary, [
        'run', `--server.http.listen-addr=${alloyHttpAddress}`, `--storage.path=${storageDirectory}`, configDirectory
    ], { env: environment, stdio: ['ignore', 'inherit', 'inherit'] });

    child.on('error', error => {
        report(`No se pudo iniciar Alloy (${error.code ?? 'ERROR'})`);
        if (local) report('Instala Alloy o indica la ruta de su ejecutable con NEXUS_ALLOY_BIN en .env');
    });
    child.on('exit', () => {
        if (!shutdownSignal && application?.exitCode === null) {
            report('Alloy se detuvo. Los logs siguen disponibles en stdout');
        }
    });
    return child;
};

const waitForCollector = async child => {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline && child.pid && child.exitCode === null && !shutdownSignal) {
        try {
            const response = await fetch(`http://${alloyHttpAddress}/-/ready`, { signal: AbortSignal.timeout(250) });
            await response.body?.cancel();
            if (response.ok) return;
        } catch {
            // Alloy puede seguir iniciando; el arranque de Nexus tiene un plazo fijo.
        }
        await wait(100);
    }
};

const collector = startCollector();
if (collector) await waitForCollector(collector);
if (!shutdownSignal) {
    application = spawn(command, args, {
        // Evita que dotenv vuelva a cargar el token de Alloy en la API.
        env: { ...process.env, GRAFANA_LOKI_TOKEN: '' },
        stdio: ['inherit', collector ? 'pipe' : 'inherit', 'inherit']
    });
    application.on('error', () => report('No se pudo iniciar la API'));

    const completed = new Promise(resolve => application.once('close', (code, signal) => {
        resolve(code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1));
    }));

    let socket;
    if (collector) {
        socket = createSocket('udp4');
        socket.on('error', () => report('Se interrumpió el envío local a Alloy'));

        application.stdout.pipe(process.stdout, { end: false });
        const lines = createInterface({ input: application.stdout, crlfDelay: Infinity });
        lines.on('line', line => {
            if (collector.exitCode !== null || collector.signalCode !== null || !line.startsWith('{') || Buffer.byteLength(line) > maxLogBytes) return;
            if (socket.getSendQueueCount() < 64) {
                socket.send([syslogHeader, Buffer.from(line)], 15140, '127.0.0.1', () => {});
            }
        });
    }

    process.exitCode = await completed;
    socket?.close();
}

if (collector?.pid && collector.exitCode === null && collector.signalCode === null) {
    const stopped = new Promise(resolve => collector.once('exit', resolve));
    const timeout = setTimeout(() => collector.kill('SIGKILL'), 3000);
    collector.kill('SIGTERM');
    await stopped;
    clearTimeout(timeout);
}
