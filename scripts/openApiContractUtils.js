import { readFile } from 'node:fs/promises';
import path from 'node:path';

const decodePointerToken = (token) => token.replaceAll('~1', '/').replaceAll('~0', '~');

const readJson = async (file, cache) => {
    if (!cache.has(file)) cache.set(file, JSON.parse(await readFile(file, 'utf8')));
    return cache.get(file);
};

const selectFragment = (document, fragment, reference) => {
    if (!fragment) return document;
    if (!fragment.startsWith('/')) throw new Error(`Fragmento JSON Pointer inválido: ${reference}`);

    return fragment.slice(1).split('/').reduce((value, token) => {
        const key = decodePointerToken(token);
        if (value?.[key] === undefined) throw new Error(`Referencia OpenAPI inexistente: ${reference}`);
        return value[key];
    }, document);
};

export const bundleOpenApiContract = async (entryFile) => {
    const cache = new Map();
    const rootFile = path.resolve(entryFile);

    const resolveExternalReferences = async (value, currentFile) => {
        if (Array.isArray(value)) {
            return Promise.all(value.map(item => resolveExternalReferences(item, currentFile)));
        }
        if (!value || typeof value !== 'object') return value;

        if (typeof value.$ref === 'string' && !value.$ref.startsWith('#')) {
            const [relativeFile, fragment = ''] = value.$ref.split('#');
            const referencedFile = path.resolve(path.dirname(currentFile), relativeFile);
            if (referencedFile === rootFile) return { $ref: `#${fragment}` };

            const document = await readJson(referencedFile, cache);
            const selected = selectFragment(document, fragment, value.$ref);
            return resolveExternalReferences(selected, referencedFile);
        }

        return Object.fromEntries(await Promise.all(
            Object.entries(value).map(async ([key, nestedValue]) => [
                key,
                await resolveExternalReferences(nestedValue, currentFile)
            ])
        ));
    };

    return resolveExternalReferences(await readJson(rootFile, cache), rootFile);
};
