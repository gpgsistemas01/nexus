import { rm } from 'node:fs/promises';

const lockedFileCodes = new Set(['EBUSY', 'EPERM']);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const removeDocumentOutput = async (
    output,
    { remove = rm, retries = 4, retryDelay = 250 } = {}
) => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            await remove(output, { force: true });
            return;
        } catch (error) {
            if (!lockedFileCodes.has(error.code)) throw error;
            if (attempt < retries) {
                await wait(retryDelay);
                continue;
            }
            throw new Error(
                `No se puede reemplazar ${output} porque está abierto o bloqueado por otro proceso. `
                + 'Cierre el documento en Word, LibreOffice o el Explorador de archivos y vuelva a ejecutar la exportación.',
                { cause: error }
            );
        }
    }
};
