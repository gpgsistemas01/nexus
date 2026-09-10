import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_CONVERTER = 'soffice';
const CONVERTER_CHECK_TIMEOUT = 15000;

const getConverterCandidates = (platform, environment) => {
    if (platform === 'win32') {
        const programFiles = environment.ProgramFiles || 'C:\\Program Files';
        return [
            path.win32.join(programFiles, 'LibreOffice', 'program', 'soffice.com'),
            'soffice.com'
        ];
    }
    if (platform === 'darwin') {
        return [
            DEFAULT_CONVERTER,
            '/Applications/LibreOffice.app/Contents/MacOS/soffice'
        ];
    }
    return [DEFAULT_CONVERTER];
};

const isCommandAvailable = (command, runCommand) => {
    const result = runCommand(command, ['--version'], {
        encoding: 'utf8',
        timeout: CONVERTER_CHECK_TIMEOUT,
        windowsHide: true
    });
    return !result.error && result.status === 0;
};

const getConfiguredConverterCandidates = (configuredConverter, platform) => {
    if (platform !== 'win32' || !/\.exe$/i.test(configuredConverter)) return [configuredConverter];

    return [configuredConverter.replace(/\.exe$/i, '.com'), configuredConverter];
};

const runInstallationCommand = (command, argumentsList, runCommand) => {
    const result = runCommand(command, argumentsList, { stdio: 'inherit', windowsHide: true });
    return !result.error && result.status === 0;
};

const installLibreOffice = ({ platform, runCommand, getUserId }) => {
    if (platform === 'linux') {
        const aptGet = isCommandAvailable('apt-get', runCommand);
        if (!aptGet) return false;

        const commandPrefix = getUserId?.() === 0 ? [] : ['sudo'];
        const command = commandPrefix[0] ?? 'apt-get';
        const prefixArguments = commandPrefix.length ? ['apt-get'] : [];
        return runInstallationCommand(command, [...prefixArguments, 'update'], runCommand)
            && runInstallationCommand(command, [...prefixArguments, 'install', '-y', 'libreoffice'], runCommand);
    }
    if (platform === 'darwin' && isCommandAvailable('brew', runCommand)) {
        return runInstallationCommand('brew', ['install', '--cask', 'libreoffice'], runCommand);
    }
    if (platform === 'win32' && isCommandAvailable('winget', runCommand)) {
        return runInstallationCommand('winget', [
            'install',
            '--id',
            'TheDocumentFoundation.LibreOffice',
            '--exact',
            '--silent',
            '--disable-interactivity',
            '--accept-package-agreements',
            '--accept-source-agreements'
        ], runCommand);
    }
    return false;
};

export const preparePdfConverter = ({
    configuredConverter,
    environment = process.env,
    platform = process.platform,
    runCommand = spawnSync,
    getUserId = process.getuid
} = {}) => {
    if (configuredConverter) {
        const configuredCandidates = getConfiguredConverterCandidates(configuredConverter, platform);
        const availableConverter = configuredCandidates.find(candidate => isCommandAvailable(candidate, runCommand));
        if (availableConverter) return availableConverter;
        throw new Error(
            `El conversor configurado en DOCS_PDF_CONVERTER (${configuredConverter}) no está disponible.`
        );
    }

    const candidates = getConverterCandidates(platform, environment);
    const availableConverter = candidates.find(candidate => isCommandAvailable(candidate, runCommand));
    if (availableConverter) return availableConverter;

    console.log('LibreOffice no está disponible; se instalará para completar la exportación PDF.');
    const installed = installLibreOffice({ platform, runCommand, getUserId });
    const installedConverter = installed
        ? candidates.find(candidate => isCommandAvailable(candidate, runCommand))
        : null;
    if (installedConverter) return installedConverter;

    throw new Error(
        'No se pudo instalar LibreOffice automáticamente. Instálalo con el gestor de paquetes del sistema '
        + 'o define DOCS_PDF_CONVERTER con la ruta de soffice.'
    );
};
