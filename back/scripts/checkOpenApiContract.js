import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { bundleOpenApiContract, validateOpenApiContract } from './openApiContractUtils.js';

const ROOT = process.cwd();
const contractPath = path.join(ROOT, 'docs/architecture/openapi/openapi.json');
const codeMapPath = path.join(ROOT, 'docs/architecture/views/development/code-map.md');

const contract = await bundleOpenApiContract(contractPath);
const codeMap = await readFile(codeMapPath, 'utf8');
const documentedOperations = new Set();

for (const { route, method } of validateOpenApiContract(contract)) {
    const expressRoute = route.replaceAll(/\{([^}]+)\}/g, ':$1');
    documentedOperations.add(`${method.toUpperCase()} ${expressRoute}`);
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
