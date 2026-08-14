import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'docs/generated/code-map.md');
const CHECK = process.argv.includes('--check');
const SOURCE_AREAS = [
    'config', 'constants', 'controllers', 'dtos', 'errors', 'lib', 'messages',
    'middleware', 'public', 'repository', 'routes', 'services', 'utils', 'validators', 'views'
];

const toPosix = (value) => value.split(path.sep).join('/');

const walk = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }));
    return nested.flat().sort();
};

const parseMounts = async (kind) => {
    const indexPath = path.join(ROOT, `src/routes/${kind}/index.js`);
    const source = await readFile(indexPath, 'utf8');
    const imports = new Map(
        [...source.matchAll(/import\s+(\w+)\s+from\s+'([^']+)'/g)]
            .map((match) => [match[1], path.resolve(path.dirname(indexPath), match[2])])
    );
    const constant = kind === 'api' ? 'API_ROUTES' : 'WEB_ROUTES';
    const block = source.match(new RegExp(`const ${constant} = \\[([\\s\\S]*?)\\n\\];`))?.[1] ?? '';

    return [...block.matchAll(/\['([^']+)',\s*(\w+)\]/g)].map((match) => ({
        mount: `${kind === 'api' ? '/api' : ''}${match[1]}`,
        file: imports.get(match[2])
    }));
};

const joinRoute = (mount, route) => {
    const suffix = route === '/' ? '' : route;
    return `${mount}${suffix}`.replace(/\/{2,}/g, '/') || '/';
};

const getRoutes = async (kind) => {
    const mounts = await parseMounts(kind);
    const routes = [];
    for (const { mount, file } of mounts) {
        const source = await readFile(file, 'utf8');
        for (const match of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*['`]([^'`]+)['`]/g)) {
            routes.push({
                method: match[1].toUpperCase(),
                route: joinRoute(mount, match[2]),
                file: toPosix(path.relative(ROOT, file))
            });
        }
    }
    return routes;
};

const getLayerDependencies = async (sourceFiles) => {
    const edges = new Set();
    for (const file of sourceFiles) {
        const relative = toPosix(path.relative(path.join(ROOT, 'src'), file));
        const from = relative.split('/')[0];
        if (!SOURCE_AREAS.includes(from)) continue;
        const source = await readFile(file, 'utf8');
        for (const match of source.matchAll(/(?:import|export)[\s\S]*?from\s+['"]([^'"]+)['"]/g)) {
            if (!match[1].startsWith('.')) continue;
            const target = toPosix(path.relative(path.join(ROOT, 'src'), path.resolve(path.dirname(file), match[1])));
            const to = target.split('/')[0];
            if (SOURCE_AREAS.includes(to) && from !== to) edges.add(`${from}|${to}`);
        }
    }
    return [...edges].sort().map((edge) => edge.split('|'));
};

const table = (routes) => [
    '| Método | Ruta | Definición |',
    '| --- | --- | --- |',
    ...routes.map(({ method, route, file }) => `| \`${method}\` | \`${route}\` | [\`${file}\`](../../${file}) |`)
].join('\n');

const generate = async () => {
    const sourceFiles = (await walk(path.join(ROOT, 'src'))).filter((file) => file.endsWith('.js'));
    const [apiRoutes, webRoutes, dependencies] = await Promise.all([
        getRoutes('api'),
        getRoutes('web'),
        getLayerDependencies(sourceFiles)
    ]);
    const counts = new Map(SOURCE_AREAS.map((area) => [area, 0]));
    sourceFiles.forEach((file) => {
        const area = toPosix(path.relative(path.join(ROOT, 'src'), file)).split('/')[0];
        if (counts.has(area)) counts.set(area, counts.get(area) + 1);
    });

    return `<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Mapa del código

Este inventario se genera **a partir del código fuente**. Ejecuta \`npm run docs:architecture\`
después de cambiar rutas o dependencias entre capas; \`npm run docs:check\` detecta si esta
versión quedó desactualizada.

## Dependencias entre áreas

Cada flecha representa al menos un \`import\` relativo desde el área de origen hacia el
área de destino. El diagrama permite detectar acoplamientos reales sin intentar mostrar
cada archivo individual.

\`\`\`mermaid
flowchart LR
${dependencies.map(([from, to]) => `    ${from}["${from} (${counts.get(from)} módulos)"] --> ${to}["${to} (${counts.get(to)} módulos)"]`).join('\n')}
\`\`\`

> Alcance: módulos JavaScript bajo \`src/\`. Los recursos EJS, CSS y el esquema Prisma se
> explican en la documentación curada, porque una lista automática no describe sus
> decisiones de diseño.

## Endpoints API (${apiRoutes.length})

${table(apiRoutes)}

## Rutas web (${webRoutes.length})

${table(webRoutes)}
`;
};

const content = await generate();
if (CHECK) {
    const current = await readFile(OUTPUT, 'utf8').catch(() => '');
    if (current !== content) {
        console.error('docs/generated/code-map.md está desactualizado. Ejecuta npm run docs:architecture.');
        process.exitCode = 1;
    } else {
        console.log('La documentación generada está actualizada.');
    }
} else {
    await writeFile(OUTPUT, content);
    console.log(`Documentación generada en ${toPosix(path.relative(ROOT, OUTPUT))}.`);
}
