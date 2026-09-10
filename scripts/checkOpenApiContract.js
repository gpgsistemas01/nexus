import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { bundleOpenApiContract } from './openApiContractUtils.js';

const ROOT = process.cwd();
const contractPath = path.join(ROOT, 'docs/architecture/openapi/openapi.json');
const codeMapPath = path.join(ROOT, 'docs/generated/code-map.md');

const contract = await bundleOpenApiContract(contractPath);
const codeMap = await readFile(codeMapPath, 'utf8');
const documentedOperations = new Set();

for (const [route, pathItem] of Object.entries(contract.paths ?? {})) {
    for (const method of Object.keys(pathItem)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
        const operation = pathItem[method];
        const successResponse = Object.entries(operation.responses ?? {})
            .find(([status]) => status.startsWith('2'))?.[1];

        if (!successResponse) throw new Error(`OpenAPI sin respuesta exitosa: ${method.toUpperCase()} ${route}`);
        if (!successResponse.content) throw new Error(`OpenAPI sin contenido de respuesta: ${method.toUpperCase()} ${route}`);
        const expressRoute = route.replaceAll(/\{([^}]+)\}/g, ':$1');
        documentedOperations.add(`${method.toUpperCase()} ${expressRoute}`);
    }
}

const implementedOperations = new Set(
    [...codeMap.matchAll(/^\| `(GET|POST|PUT|PATCH|DELETE)` \| `([^`]+)` \| \[`src\/routes\/api\//gm)]
        .map(([, method, route]) => `${method} ${route}`)
);
const missing = [...implementedOperations].filter(operation => !documentedOperations.has(operation));
const stale = [...documentedOperations].filter(operation => !implementedOperations.has(operation));

if (missing.length || stale.length) {
    throw new Error([
        missing.length ? `Operaciones sin contrato: ${missing.join(', ')}` : '',
        stale.length ? `Operaciones obsoletas en OpenAPI: ${stale.join(', ')}` : ''
    ].filter(Boolean).join('\n'));
}

console.log(`Contrato OpenAPI válido y sincronizado (${documentedOperations.size} operaciones).`);
