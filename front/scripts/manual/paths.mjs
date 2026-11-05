import { access, mkdir, rename, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validProfileId } from './profiles.mjs';

// Ruta relativa a docs; las ediciones locales no son fuentes del catálogo general.
export const MANUAL_ACCOUNTS_PATH = 'user-manual/accounts';

export const isManualAccountPath = (source) =>
    source === MANUAL_ACCOUNTS_PATH || source.startsWith(`${MANUAL_ACCOUNTS_PATH}/`);

export const manualAccountDirectory = (frontRoot, id) => {
    if (!validProfileId(id)) throw new Error('Identificador de manual inválido.');

    return path.join(frontRoot, 'docs', MANUAL_ACCOUNTS_PATH, id);
};

export const prepareManualDirectory = async (frontRoot, id) => {
    const directory = manualAccountDirectory(frontRoot, id);
    try {
        await access(directory);
        return directory;
    } catch (cause) {
        if (cause.code !== 'ENOENT') throw cause;
    }

    const previous = path.join(frontRoot, 'build/manuals', id);
    try {
        await access(previous);
    } catch (cause) {
        if (cause.code !== 'ENOENT') throw cause;

        return directory;
    }

    await mkdir(path.dirname(directory), { recursive: true });
    await rename(previous, directory);
    const manifestFile = path.join(directory, 'manifest.json');
    try {
        const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
        await writeFile(
            manifestFile,
            JSON.stringify({ ...manifest, root: directory }, null, 2) + '\n',
        );
    } catch (cause) {
        if (cause.code !== 'ENOENT') throw cause;
    }
    return directory;
};
