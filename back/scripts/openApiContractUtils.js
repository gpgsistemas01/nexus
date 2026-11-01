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

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

export const validateOpenApiContract = (contract) => {
    const resolve = (value) => value?.$ref
        ? selectFragment(contract, value.$ref.slice(1), value.$ref)
        : value;
    const checkReferences = (value) => {
        if (!value || typeof value !== 'object') return;
        if (typeof value.$ref === 'string') {
            if (!value.$ref.startsWith('#/')) throw new Error(`Referencia sin resolver: ${value.$ref}`);
            resolve(value);
        }
        Object.values(value).forEach(checkReferences);
    };
    const checkParameters = (parameters = []) => {
        const keys = new Set();
        return parameters.map((reference) => {
            const parameter = resolve(reference);
            const key = `${parameter.in}:${parameter.name}`;
            if (keys.has(key)) throw new Error(`Parámetro OpenAPI repetido: ${key}`);
            keys.add(key);
            return parameter;
        });
    };

    if (!/^3\.1\.\d+$/.test(contract.openapi ?? '')) throw new Error('Se requiere OpenAPI 3.1.');
    checkReferences(contract);

    const tags = new Set((contract.tags ?? []).map(tag => tag.name));
    const operationIds = new Set();
    const operations = [];

    for (const [route, pathItem] of Object.entries(contract.paths ?? {})) {
        if (!route.startsWith('/api/')) throw new Error(`Ruta web fuera del contrato API: ${route}`);
        const pathParameters = checkParameters(pathItem.parameters);

        for (const [method, operation] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(method)) continue;
            const label = `${method.toUpperCase()} ${route}`;

            if (!operation.summary?.trim()) throw new Error(`Resumen OpenAPI ausente: ${label}`);
            if (!operation.operationId || operationIds.has(operation.operationId)) {
                throw new Error(`operationId ausente o repetido: ${label}`);
            }
            operationIds.add(operation.operationId);
            if (!operation.tags?.length || operation.tags.some(tag => !tags.has(tag))) {
                throw new Error(`Grupo OpenAPI ausente o no declarado: ${label}`);
            }

            const security = operation.security ?? contract.security;
            if (!Array.isArray(security)) throw new Error(`Autenticación no declarada: ${label}`);
            for (const requirement of security) {
                for (const name of Object.keys(requirement)) {
                    if (!contract.components?.securitySchemes?.[name]) {
                        throw new Error(`Esquema de autenticación desconocido: ${name}`);
                    }
                }
            }

            const parameters = [...pathParameters, ...checkParameters(operation.parameters)];
            for (const [, name] of route.matchAll(/\{([^}]+)\}/g)) {
                if (!parameters.some(parameter => parameter.in === 'path' && parameter.name === name && parameter.required === true)) {
                    throw new Error(`Parámetro de ruta no declarado: ${label} {${name}}`);
                }
            }

            const responses = Object.entries(operation.responses ?? {});
            if (!responses.some(([status]) => /^2\d\d$/.test(status))) {
                throw new Error(`OpenAPI sin respuesta exitosa: ${label}`);
            }
            for (const [status, reference] of responses) {
                const response = resolve(reference);
                if (!response?.description?.trim()) throw new Error(`Respuesta sin descripción: ${label} ${status}`);
                if (/^2\d\d$/.test(status) && !['204', '205'].includes(status) && method !== 'head' && !response.content) {
                    throw new Error(`Respuesta exitosa sin contenido: ${label} ${status}`);
                }
            }
            operations.push({ route, method, operation });
        }
    }

    return operations;
};
