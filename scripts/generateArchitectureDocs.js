import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUTPUTS = {
    codeMap: path.join(ROOT, 'docs/generated/code-map.md'),
    database: path.join(ROOT, 'docs/generated/database-schema.md')
};
const CHECK = process.argv.includes('--check');
const SOURCE_AREAS = [
    'config', 'constants', 'controllers', 'dtos', 'errors', 'lib', 'messages',
    'middleware', 'public', 'repository', 'routes', 'services', 'utils', 'validators', 'views'
];
const DATABASE_AREAS = [
    ['Identidad, acceso y auditoría', ['Department', 'Role', 'User', 'Person', 'UserRoleDepartment', 'PersonRoleDepartment', 'CriticalWriteAudit']],
    ['Catálogos y relaciones comerciales', ['Status', 'FulfillmentStatus', 'Project', 'Client', 'Supplier', 'Material', 'UnitMeasure', 'Presentation', 'SupplierMaterial', 'ReferenceNumberCounter']],
    ['Compras, requisiciones e inventario de materiales', ['PurchaseRequisition', 'PurchaseRequisitionDetail', 'GoodsReceipt', 'GoodsReceiptDetail', 'GoodsReceiptDetailChange', 'GoodsIssue', 'GoodsIssueDetail', 'GoodsIssueReturn', 'InventoryMovement', 'MovementDetail', 'StockAdjustment', 'StockAdjustmentDetail', 'StockAdjustmentReason']],
    ['Mermas e inventario de merma', ['Waste', 'WasteIssue', 'WasteIssueDetail', 'WasteIssueReturn', 'WasteMovement', 'WasteMovementDetail', 'WasteStockAdjustment', 'WasteStockAdjustmentDetail']]
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

const generateCodeMap = async () => {
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

const parsePrismaModels = (schema) => {
    const models = new Map();
    const scalarTypes = new Set(['BigInt', 'Boolean', 'Bytes', 'DateTime', 'Decimal', 'Float', 'Int', 'Json', 'String']);
    const enumTypes = new Set([...schema.matchAll(/^enum\s+(\w+)\s*\{/gm)].map((match) => match[1]));
    for (const match of schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
        const [, name, body] = match;
        const fields = [];
        const relations = [];
        for (const rawLine of body.split('\n')) {
            const line = rawLine.trim();
            if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
            const field = line.match(/^(\w+)\s+([\w]+)(\[\]|\?)?(.*)$/);
            if (!field) continue;
            const [, fieldName, type, modifier = '', attributes] = field;
            const relation = attributes.match(/@relation\([^)]*fields:\s*\[([^\]]+)\]/);
            if (relation) {
                relations.push({ field: fieldName, target: type, optional: modifier === '?', foreignKeys: relation[1].split(',').map((value) => value.trim()) });
                continue;
            }
            if (modifier === '[]' || (!scalarTypes.has(type) && !enumTypes.has(type))) continue;
            const keys = [attributes.includes('@id') ? 'PK' : '', attributes.includes('@unique') ? 'UK' : ''].filter(Boolean).join(',');
            fields.push({ name: fieldName, type, keys });
        }
        const foreignKeys = new Set(relations.flatMap(({ foreignKeys: keys }) => keys));
        const compoundPrimaryKeys = new Set((body.match(/@@id\(\[([^\]]+)\]\)/)?.[1] ?? '')
            .split(',').map((value) => value.trim()).filter(Boolean));
        fields.forEach((field) => {
            if (compoundPrimaryKeys.has(field.name)) field.keys = [field.keys, 'PK'].filter(Boolean).join(',');
            if (foreignKeys.has(field.name)) field.keys = [field.keys, 'FK'].filter(Boolean).join(',');
        });
        models.set(name, { fields, relations });
    }
    return models;
};

const renderEntity = (name, model) => [
    `    ${name} {`,
    ...model.fields.map(({ name: field, type, keys }) => `        ${type} ${field}${keys ? ` ${keys}` : ''}`),
    '    }'
].join('\n');

const generateDatabaseSchema = async () => {
    const models = parsePrismaModels(await readFile(path.join(ROOT, 'prisma/schema.prisma'), 'utf8'));
    const documented = new Set(DATABASE_AREAS.flatMap(([, names]) => names));
    const missing = [...models.keys()].filter((name) => !documented.has(name));
    if (missing.length) throw new Error(`Modelos Prisma sin área documental: ${missing.join(', ')}`);
    const diagrams = DATABASE_AREAS.map(([title, names]) => {
        const selected = new Set(names);
        const entities = names.map((name) => renderEntity(name, models.get(name))).join('\n');
        const relations = names.flatMap((source) => models.get(source).relations
            .filter(({ target }) => selected.has(target))
            .map(({ field, target, optional }) => `    ${target} ${optional ? 'o|' : '||'}--o{ ${source} : "${field}"`));
        return `## ${title}\n\n\`\`\`mermaid\nerDiagram\n${entities}\n${relations.join('\n')}\n\`\`\``;
    }).join('\n\n');
    return `<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diagramas de la base de datos

Estos diagramas ER se generan desde los modelos y relaciones de
\`prisma/schema.prisma\`. Se separan por área para que puedan leerse y revisarse en
GitHub; las relaciones que cruzan áreas se describen en la sección final.

La marca \`PK\` identifica claves primarias, \`FK\` claves foráneas y \`UK\` campos
únicos. Los campos compuestos y demás restricciones siguen teniendo como fuente de
verdad el esquema Prisma y sus migraciones.

${diagrams}

## Relaciones entre áreas

Los modelos de identidad y catálogo son referenciados desde los documentos de compra,
salida, ajuste y merma. Para evitar repetir entidades y producir diagramas ilegibles,
cada diagrama detalla las relaciones internas de su área; consulta el esquema Prisma
para las relaciones transversales y las reglas \`onDelete\`/\`onUpdate\`.
`;
};

const contents = new Map([
    [OUTPUTS.codeMap, await generateCodeMap()],
    [OUTPUTS.database, await generateDatabaseSchema()]
]);
if (CHECK) {
    const stale = [];
    for (const [output, content] of contents) {
        const current = await readFile(output, 'utf8').catch(() => '');
        if (current !== content) stale.push(toPosix(path.relative(ROOT, output)));
    }
    if (stale.length) {
        console.error(`${stale.join(', ')} está desactualizado. Ejecuta npm run docs:architecture.`);
        process.exitCode = 1;
    } else {
        console.log('La documentación generada está actualizada.');
    }
} else {
    for (const [output, content] of contents) await writeFile(output, content);
    console.log(`Documentación generada en ${[...contents.keys()].map((output) => toPosix(path.relative(ROOT, output))).join(', ')}.`);
}
