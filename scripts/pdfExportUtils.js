import { readFile } from 'node:fs/promises';

const PDF_HEADER = Buffer.from('%PDF-');
const PDF_END_MARKER = /%%EOF\s*$/;

export const validatePdfOutput = async (file, readFileContent = readFile) => {
    const content = await readFileContent(file);
    const header = content.subarray(0, 1024);
    const trailer = content.subarray(Math.max(0, content.length - 1024)).toString('latin1');

    if (!header.includes(PDF_HEADER) || !PDF_END_MARKER.test(trailer)) {
        throw new Error(`El archivo generado no tiene una estructura PDF completa: ${file}.`);
    }

    return file;
};
