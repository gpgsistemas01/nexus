import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { MERMAID_CLI_VERSION, MERMAID_VERSION } from './mermaidExportUtils.js';

const hasCompatibleRenderer = (executable, readManifest) => {
    try {
        const cliManifest = readManifest(path.resolve(path.dirname(executable), '../package.json'));
        const mermaidEntry = createRequire(executable).resolve('mermaid');
        const mermaidManifest = readManifest(path.resolve(path.dirname(mermaidEntry), '../package.json'));
        return cliManifest.version === MERMAID_CLI_VERSION && mermaidManifest.version === MERMAID_VERSION;
    } catch {
        return false;
    }
};

export const prepareMermaidCli = ({
    executable,
    environment = process.env,
    platform = process.platform,
    runCommand = spawnSync,
    fileExists = existsSync,
    isCompatible = executablePath => hasCompatibleRenderer(
        executablePath,
        manifestPath => JSON.parse(readFileSync(manifestPath, 'utf8'))
    )
}) => {
    if (fileExists(executable) && isCompatible(executable)) return executable;

    const npmCommand = environment.npm_execpath
        ? process.execPath
        : (platform === 'win32' ? 'npm.cmd' : 'npm');
    const npmArguments = environment.npm_execpath ? [environment.npm_execpath] : [];
    console.log(`Se preparará Mermaid CLI ${MERMAID_CLI_VERSION} con Mermaid ${MERMAID_VERSION} para exportar UML.`);
    const installation = runCommand(npmCommand, [
        ...npmArguments,
        'install',
        '--no-save',
        '--package-lock=false',
        `@mermaid-js/mermaid-cli@${MERMAID_CLI_VERSION}`,
        `mermaid@${MERMAID_VERSION}`
    ], { stdio: 'inherit' });

    if (!installation.error && installation.status === 0 && fileExists(executable) && isCompatible(executable)) return executable;

    throw new Error(
        'No se pudo instalar Mermaid CLI automáticamente. Comprueba el acceso al registro de npm '
        + `o ejecuta npm install --no-save --package-lock=false @mermaid-js/mermaid-cli@${MERMAID_CLI_VERSION} mermaid@${MERMAID_VERSION}.`
    );
};
