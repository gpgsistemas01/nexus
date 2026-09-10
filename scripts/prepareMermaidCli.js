import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

export const prepareMermaidCli = ({
    executable,
    environment = process.env,
    platform = process.platform,
    runCommand = spawnSync,
    fileExists = existsSync
}) => {
    if (fileExists(executable)) return executable;

    const npmCommand = environment.npm_execpath
        ? process.execPath
        : (platform === 'win32' ? 'npm.cmd' : 'npm');
    const npmArguments = environment.npm_execpath ? [environment.npm_execpath] : [];
    console.log('Mermaid CLI no está disponible; se instalará temporalmente para exportar los diagramas.');
    const installation = runCommand(npmCommand, [
        ...npmArguments,
        'install',
        '--no-save',
        '--package-lock=false',
        '@mermaid-js/mermaid-cli'
    ], { stdio: 'inherit' });

    if (!installation.error && installation.status === 0 && fileExists(executable)) return executable;

    throw new Error(
        'No se pudo instalar Mermaid CLI automáticamente. Comprueba el acceso al registro de npm '
        + 'o ejecuta npm install --no-save --package-lock=false @mermaid-js/mermaid-cli.'
    );
};
