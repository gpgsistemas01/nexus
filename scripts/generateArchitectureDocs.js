import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUTPUTS = {
    codeMap: path.join(ROOT, 'docs/generated/code-map.md'),
    database: path.join(ROOT, 'docs/generated/database-schema.md'),
    dataDictionary: path.join(ROOT, 'docs/generated/data-dictionary.md')
};
const CHECK = process.argv.includes('--check');
const SOURCE_AREAS = [
    'config', 'constants', 'controllers', 'dtos', 'errors', 'lib', 'messages',
    'middleware', 'public', 'repository', 'routes', 'services', 'utils', 'validators', 'views'
];
const DATABASE_AREAS = [
    ['Identidad, acceso y auditoría', ['Department', 'Role', 'User', 'Person', 'UserRoleDepartment', 'PersonRoleDepartment', 'CriticalWriteAudit']],
    ['Catálogos y relaciones comerciales', ['Status', 'FulfillmentStatus', 'Project', 'Client', 'Supplier', 'Material', 'UnitMeasure', 'Presentation', 'SupplierMaterial', 'ReferenceNumberCounter']],
    ['Compras e inventario de materiales', ['GoodsReceipt', 'GoodsReceiptDetail', 'GoodsReceiptDetailChange', 'GoodsIssue', 'GoodsIssueDetail', 'GoodsIssueReturn', 'InventoryMovement', 'MovementDetail', 'StockAdjustment', 'StockAdjustmentDetail', 'StockAdjustmentReason']],
    ['Mermas e inventario de merma', ['Waste', 'WasteIssue', 'WasteIssueDetail', 'WasteIssueReturn', 'WasteMovement', 'WasteMovementDetail', 'WasteStockAdjustment', 'WasteStockAdjustmentDetail']]
];
const USE_CASE_DOCUMENTS = {
    catalog: path.join(ROOT, 'docs/requirements/use-case-descriptions.md'),
    backendMatrix: path.join(ROOT, 'docs/architecture/backend-technical-documentation.md'),
    backendDiagrams: path.join(ROOT, 'docs/architecture/backend-code-sequences'),
    frontendMatrix: path.join(ROOT, 'docs/architecture/frontend-technical-documentation.md'),
    frontendDiagrams: path.join(ROOT, 'docs/architecture/frontend-code-sequences')
};

const readDocumentSource = async (documentPath) => {
    const entries = await readdir(documentPath, { withFileTypes: true }).catch(() => null);
    if (!entries) return readFile(documentPath, 'utf8');
    const chapterOrder = [
        'index.md',
        'authentication.md',
        'identity-access.md',
        'catalogs.md',
        'purchases.md',
        'issues.md',
        'reports.md'
    ];
    const availableFiles = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
    const unexpectedFiles = [...availableFiles].filter((file) => file.endsWith('.md') && !chapterOrder.includes(file));
    if (unexpectedFiles.length) {
        throw new Error(`Colección documental con capítulos no registrados: ${unexpectedFiles.join(', ')}`);
    }
    return (await Promise.all(chapterOrder.map((file) => readFile(path.join(documentPath, file), 'utf8')))).join('\n');
};

const toPosix = (value) => value.split(path.sep).join('/');

const walk = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }));
    return nested.flat().sort();
};

const getUseCaseTableIds = (source) => [...source.matchAll(/^\| `(CU-[A-Z]+-\d+)` \|/gm)]
    .map((match) => match[1]);

const getMermaidBlocks = (source) => [...source.matchAll(/^```mermaid\n([\s\S]*?)^```$/gm)]
    .map((match) => match[1]);

// Mermaid treats these sequence keywords case-insensitively, so they cannot be aliases.
const RESERVED_SEQUENCE_ALIASES = new Set([
    'actor', 'alt', 'and', 'autonumber', 'break', 'critical', 'details', 'else', 'end',
    'loop', 'note', 'opt', 'option', 'par', 'participant', 'rect'
]);
const MIN_SEQUENCE_MESSAGES = 7;
const MIN_SEQUENCE_CALLS = 2;
const GENERIC_SEQUENCE_MESSAGES = [
    'devolver resultado o error del caso',
    'emitir respuesta observable',
    'devolver respuesta normalizada',
    'presentar resultado observable'
];
const EXTERNAL_SEQUENCE_PARTICIPANTS = new Set([
    'Cliente HTTP / web',
    'Navegador',
    'Prisma / PostgreSQL',
    'Respuesta Express'
]);
const SOURCE_PATH_PATTERN = /src\/[A-Za-z0-9_./-]+\.(?:ejs|js)/g;

const validateUseCaseDiagramCoverage = async () => {
    const sources = new Map(await Promise.all(
        Object.entries(USE_CASE_DOCUMENTS).map(async ([name, file]) => [name, await readDocumentSource(file)])
    ));
    const expectedIds = getUseCaseTableIds(sources.get('catalog'));
    const failures = [];
    const sourceFiles = new Set((await walk(path.join(ROOT, 'src')))
        .map((file) => toPosix(path.relative(ROOT, file))));

    if (!expectedIds.length) failures.push('catálogo: no contiene casos de uso');
    const catalogDuplicates = expectedIds.filter((id, index) => expectedIds.indexOf(id) !== index);
    if (catalogDuplicates.length) {
        failures.push(`catálogo: identificadores duplicados (${[...new Set(catalogDuplicates)].join(', ')})`);
    }

    const validateIds = (name, actualIds) => {
        const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
        if (duplicates.length) failures.push(`${name}: identificadores duplicados (${[...new Set(duplicates)].join(', ')})`);
        if (actualIds.join('|') !== expectedIds.join('|')) {
            failures.push(`${name}: la cobertura o el orden no coincide con el catálogo de casos de uso`);
        }
    };

    for (const side of ['backend', 'frontend']) {
        const matrix = sources.get(`${side}Matrix`);
        const prefix = side === 'backend' ? 'BE' : 'FE';
        validateIds(`matriz ${side}`, getUseCaseTableIds(matrix));
        for (const id of expectedIds) {
            const group = id.split('-')[1];
            const groupFiles = {
                AUT: 'authentication',
                IDA: 'identity-access',
                CAT: 'catalogs',
                ENT: 'purchases',
                SAL: 'issues',
                REP: 'reports'
            };
            const diagramFile = `${side}-code-sequences/${groupFiles[group]}.md`;
            const diagramReference = `[\`DIA-${prefix}-${id}\`](${diagramFile}#${id.toLowerCase()})`;
            if (!matrix.includes(diagramReference)) {
                failures.push(`matriz ${side}: ${id} no enlaza su diagrama aplicado`);
            }
        }
    }

    for (const side of ['backend', 'frontend']) {
        const source = sources.get(`${side}Diagrams`);
        const patternPrefix = side === 'backend' ? 'BE' : 'FE';
        const appliedPatterns = new Set(
            [...source.matchAll(new RegExp(`\\b${patternPrefix}-P\\d{2}\\b`, 'g'))]
                .map((match) => match[0])
        );
        const linkedPatterns = new Set(
            [...source.matchAll(new RegExp(
                '^\\| `(' + patternPrefix + '-P\\d{2})` \\|[^\\n]+\\[`DIA-PAT-[A-Z]+-\\d{3}`\\]',
                'gm'
            ))]
                .map((match) => match[1])
        );
        for (const pattern of appliedPatterns) {
            if (!linkedPatterns.has(pattern)) {
                failures.push(`diagramas ${side}: ${pattern} no enlaza una vista canónica DIA-PAT-* desde el índice rápido`);
            }
        }
        const sections = [...source.matchAll(/^## `(CU-[A-Z]+-\d+)`\n([\s\S]*?)(?=^## `CU-|(?![\s\S]))/gm)];
        validateIds(`diagramas ${side}`, sections.map((match) => match[1]));
        for (const [, id, body] of sections) {
            if ((body.match(/^```mermaid$/gm) ?? []).length !== 1) {
                failures.push(`diagramas ${side}: ${id} debe contener exactamente un bloque Mermaid`);
            }
            if (!body.includes('**Patrones:**')) {
                failures.push(`diagramas ${side}: ${id} no referencia sus patrones aplicados`);
            }
            if ((body.match(/^sequenceDiagram$/gm) ?? []).length !== 1) {
                failures.push(`diagramas ${side}: ${id} debe contener exactamente una secuencia de código`);
            }
            if (!body.includes('Variables de frontera:')) {
                failures.push(`diagramas ${side}: ${id} no identifica sus variables de frontera`);
            }
            const sequence = getMermaidBlocks(body)[0] ?? '';
            const messages = sequence.split('\n').filter((line) => line.includes('->>'));
            if (messages.length < MIN_SEQUENCE_MESSAGES) {
                failures.push(`diagramas ${side}: ${id} no alcanza el detalle mínimo de ${MIN_SEQUENCE_MESSAGES} mensajes ordenados`);
            }
            const calls = messages.flatMap((line) => (
                line.match(/\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?\(/g) ?? []
            ));
            if (calls.length < MIN_SEQUENCE_CALLS) {
                failures.push(`diagramas ${side}: ${id} no identifica al menos ${MIN_SEQUENCE_CALLS} métodos o funciones con sus variables`);
            }
            const foundGenericMessages = GENERIC_SEQUENCE_MESSAGES.filter((message) => sequence.includes(message));
            if (foundGenericMessages.length) {
                failures.push(`diagramas ${side}: ${id} conserva mensajes genéricos sin resultado ni responsabilidad (${foundGenericMessages.join(', ')})`);
            }
            const tracedParticipants = sequence.match(/participant .* as .*src\//g) ?? [];
            if (tracedParticipants.length < 2) {
                failures.push(`diagramas ${side}: ${id} no traza al menos dos participantes a archivos src/`);
            }
            if (side === 'frontend' && sequence.includes('/api/')
                && !sequence.includes('participant HTTP as src/public/js/services/axiosInstanceApi.js')) {
                failures.push(`diagramas frontend: ${id} no identifica el cliente HTTP compartido axiosInstanceApi.js`);
            }
            if (side === 'frontend' && /^\s*participant .*src\/public\/js\/application\/.*<br\/>src\/public\/js\/services\//m.test(sequence)) {
                failures.push(`diagramas frontend: ${id} agrupa aplicación y request sin identificar sus archivos como participantes separados`);
            }
            if (new RegExp(`(?:BE|FE)-P\\d{2}`).test(sequence)) {
                failures.push(`diagramas ${side}: ${id} repite el índice de patrones dentro de Mermaid`);
            }
            if (/^\s*participant\s+.*«controller»/m.test(sequence)) {
                failures.push(`diagramas ${side}: ${id} repite el estereotipo «controller» además de la figura de control`);
            }
            if (!/^\s*participant\s+\S+@\{\s*"type"\s*:\s*"control"\s*\}\s+as\s+(?!«controller»)/m.test(sequence)) {
                failures.push(`diagramas ${side}: ${id} no representa el controller con una figura Mermaid de tipo control`);
            }
            const aliases = [...sequence.matchAll(/^\s*(?:actor|participant)\s+([^\s@]+)(?:@\{[^}]+\})?\s+as\s+/gm)]
                .map((match) => match[1].toLowerCase());
            const reservedAliases = aliases.filter((alias) => RESERVED_SEQUENCE_ALIASES.has(alias));
            if (reservedAliases.length) {
                failures.push(`diagramas ${side}: ${id} usa alias reservados de Mermaid (${reservedAliases.join(', ')})`);
            }
            const participants = [...sequence.matchAll(/^\s*participant\s+([^\s@]+)(?:@\{[^}]+\})?\s+as\s+(.+)$/gm)];
            for (const [, alias, label] of participants) {
                if (label.includes('«object»') && !label.startsWith('«object»<br/>')) {
                    failures.push(`diagramas ${side}: ${id} no muestra «object» en la cabecera de ${alias}`);
                }
                const paths = label.match(SOURCE_PATH_PATTERN) ?? [];
                if (label.includes('«object»') && (
                    !label.includes('src/dtos/')
                    || !/«object»<br\/>[A-Za-z_$][\w$]*Dto<br\/>/.test(label)
                )) {
                    failures.push(`diagramas ${side}: ${id} identifica ${alias} como «object» sin un DTO JSON concreto y su archivo src/dtos/`);
                }
                if (!paths.length && !EXTERNAL_SEQUENCE_PARTICIPANTS.has(label)) {
                    failures.push(`diagramas ${side}: ${id} identifica ${alias} sin archivo src/ ni límite externo reconocido (${label})`);
                }
                for (const sourcePath of paths) {
                    if (!sourceFiles.has(sourcePath)) {
                        failures.push(`diagramas ${side}: ${id} referencia un archivo inexistente en ${alias} (${sourcePath})`);
                    }
                }
            }
        }
    }

    for (const side of ['backend', 'frontend']) {
        const source = sources.get(`${side}Matrix`);
        const contextualIds = [...source.matchAll(/\*\*Caso:\*\* `(CU-[A-Z]+-\d+)`/g)]
            .map((match) => match[1]);
        const expectedOrder = new Map(expectedIds.map((id, index) => [id, index]));
        if (contextualIds.some((id, index) => (
            index > 0 && expectedOrder.get(id) < expectedOrder.get(contextualIds[index - 1])
        ))) {
            failures.push(`vistas dinámicas ${side}: los diagramas no siguen el orden del catálogo de casos de uso`);
        }
    }

    const documentationFiles = (await walk(path.join(ROOT, 'docs')))
        .filter((file) => file.endsWith('.md'));
    for (const file of documentationFiles) {
        const name = toPosix(path.relative(ROOT, file));
        const source = await readFile(file, 'utf8');
        for (const block of getMermaidBlocks(source).filter((body) => body.startsWith('sequenceDiagram\n'))) {
            if (block.split('\n').some((line) => line.includes(';'))) {
                failures.push(`${name}: una secuencia Mermaid contiene un punto y coma no compatible con GitHub`);
            }
            const messages = block.split('\n').filter((line) => line.includes('->>'));
            if (messages.length < MIN_SEQUENCE_MESSAGES) {
                failures.push(`${name}: una secuencia no alcanza el detalle mínimo de ${MIN_SEQUENCE_MESSAGES} mensajes ordenados`);
            }
            const foundGenericMessages = GENERIC_SEQUENCE_MESSAGES.filter((message) => block.includes(message));
            if (foundGenericMessages.length) {
                failures.push(`${name}: una secuencia conserva mensajes genéricos sin resultado ni responsabilidad (${foundGenericMessages.join(', ')})`);
            }
        }
    }

    if (failures.length) throw new Error(`Cobertura de casos de uso inválida:\n- ${failures.join('\n- ')}`);
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

const getNamedExports = (source) => [...source.matchAll(
    /export\s+(?:const|function|class)\s+(\w+)/g
)].map((match) => match[1]).sort();

const getModuleExports = async (sourceFiles, area) => {
    const areaRoot = path.join(ROOT, 'src', area);
    const modules = [];
    for (const file of sourceFiles.filter((sourceFile) => sourceFile.startsWith(`${areaRoot}${path.sep}`))) {
        const exports = getNamedExports(await readFile(file, 'utf8'));
        if (!exports.length) continue;
        modules.push({
            file: toPosix(path.relative(ROOT, file)),
            exports
        });
    }
    return modules;
};

const moduleExportsTable = (modules) => [
    '| Módulo | Símbolos exportados |',
    '| --- | --- |',
    ...modules.map(({ file, exports }) => (
        `| [\`${file}\`](../../${file}) | ${exports.map((name) => `\`${name}\``).join(', ')} |`
    ))
].join('\n');

const generateCodeMap = async () => {
    const sourceFiles = (await walk(path.join(ROOT, 'src'))).filter((file) => file.endsWith('.js'));
    const [apiRoutes, webRoutes, dependencies, controllerModules, serviceModules] = await Promise.all([
        getRoutes('api'),
        getRoutes('web'),
        getLayerDependencies(sourceFiles),
        getModuleExports(sourceFiles, 'controllers'),
        getModuleExports(sourceFiles, 'services')
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
versión quedó desactualizada. La semántica y el patrón de esta vista se describen en las
[convenciones de diagramas](../architecture/diagram-conventions.md).

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

## Símbolos exportados por controladores

Este inventario enumera los nombres públicos declarados por los módulos bajo
\`src/controllers\`. Permite localizar el adaptador HTTP o web sin inferir su propósito
desde el nombre. La responsabilidad, entrada, salida y servicio coordinado se explican
en la [documentación técnica del backend](../architecture/backend-technical-documentation.md)
cuando el flujo necesita una vista curada.

${moduleExportsTable(controllerModules)}

## Símbolos exportados por servicios

Este inventario enumera los nombres públicos declarados por los módulos bajo
\`src/services\`. No presenta cada export como regla de negocio ni sustituye el contrato
de la función: los parámetros, efectos, transacciones, errores y pruebas se documentan
sólo cuando aportan información que el código no expresa por sí mismo.

${moduleExportsTable(serviceModules)}
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
            fields.push({ name: fieldName, type, modifier, attributes, keys });
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

const parsePrismaEnums = (schema) => [...schema.matchAll(/^enum\s+(\w+)\s*\{([\s\S]*?)^\}/gm)]
    .map(([, name, body]) => ({
        name,
        values: body.split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => line.split(/\s+/)[0])
    }));

const renderEntity = (name, model) => [
    `    ${name} {`,
    ...model.fields.map(({ name: field, type, keys }) => `        ${type} ${field}${keys ? ` ${keys}` : ''}`),
    '    }'
].join('\n');

const validateDatabaseAreas = (models) => {
    const documented = new Set(DATABASE_AREAS.flatMap(([, names]) => names));
    const undocumented = [...models.keys()].filter((name) => !documented.has(name));
    const removed = [...documented].filter((name) => !models.has(name));
    const errors = [
        undocumented.length ? `Modelos Prisma sin área documental: ${undocumented.join(', ')}` : '',
        removed.length ? `Modelos documentales ausentes del esquema Prisma: ${removed.join(', ')}` : ''
    ].filter(Boolean);
    if (errors.length) throw new Error(errors.join('. '));
};

const markdownValue = (value) => value ? `\`${value.replaceAll('|', '\\|')}\`` : '—';

const getAttributeCall = (attributes, attribute) => {
    const start = attributes.indexOf(`${attribute}(`);
    if (start < 0) return '';
    let depth = 0;
    let quote = '';
    for (let index = start + attribute.length; index < attributes.length; index += 1) {
        const character = attributes[index];
        if (quote) {
            if (character === quote && attributes[index - 1] !== '\\') quote = '';
            continue;
        }
        if (character === '"' || character === "'") {
            quote = character;
        } else if (character === '(') {
            depth += 1;
        } else if (character === ')') {
            depth -= 1;
            if (depth === 0) return attributes.slice(start + attribute.length + 1, index);
        }
    }
    return '';
};

const renderDataDictionaryModel = (name, model) => {
    const fields = model.fields.map((field) => {
        const defaultValue = getAttributeCall(field.attributes, '@default');
        const databaseType = field.attributes.match(/@db\.\w+(?:\([^)]*\))?/)?.[0] ?? '';
        const rules = [databaseType, field.attributes.includes('@updatedAt') ? '@updatedAt' : ''].filter(Boolean).join(' ');
        return `| \`${field.name}\` | \`${field.type}${field.modifier}\` | ${field.modifier === '?' ? 'No' : 'Sí'} | ${field.keys || '—'} | ${markdownValue(defaultValue)} | ${markdownValue(rules)} |`;
    });
    const relations = model.relations.length
        ? [
            '',
            '| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |',
            '| --- | --- | --- | --- |',
            ...model.relations.map(({ field, target, optional, foreignKeys }) => `| \`${field}\` | \`${target}\` | ${foreignKeys.map((key) => `\`${key}\``).join(', ')} | ${optional ? 'Cero o uno' : 'Exactamente uno'} |`)
        ]
        : [];
    return [
        `### \`${name}\``,
        '',
        '| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |',
        '| --- | --- | --- | --- | --- | --- |',
        ...fields,
        ...relations
    ].join('\n');
};

const generateDatabaseSchema = async () => {
    const models = parsePrismaModels(await readFile(path.join(ROOT, 'prisma/schema.prisma'), 'utf8'));
    validateDatabaseAreas(models);
    const areaByModel = new Map(DATABASE_AREAS.flatMap(([area, names]) => (
        names.map((name) => [name, area])
    )));
    const diagrams = DATABASE_AREAS.map(([title, names]) => {
        const selected = new Set(names);
        const entities = names.map((name) => renderEntity(name, models.get(name))).join('\n');
        const relations = names.flatMap((source) => models.get(source).relations
            .filter(({ target }) => selected.has(target))
            .map(({ field, target, optional }) => `    ${target} ${optional ? 'o|' : '||'}--o{ ${source} : "${field}"`));
        return `## ${title}\n\n\`\`\`mermaid\nerDiagram\n${entities}\n${relations.join('\n')}\n\`\`\``;
    }).join('\n\n');
    const crossAreaRelations = [...models.entries()].flatMap(([source, model]) => (
        model.relations
            .filter(({ target }) => areaByModel.get(source) !== areaByModel.get(target))
            .map(({ field, target, optional }) => `    ${target} ${optional ? 'o|' : '||'}--o{ ${source} : "${field}"`)
    ));
    return `<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diagramas de la base de datos

Estos diagramas ER se generan desde los modelos y relaciones de
\`prisma/schema.prisma\`. Se separan por área para que puedan leerse y revisarse en
GitHub; las relaciones que cruzan áreas se describen en la sección final. La semántica
y el patrón de esta vista se describen en las
[convenciones de diagramas](../architecture/diagram-conventions.md).

La marca \`PK\` identifica claves primarias, \`FK\` claves foráneas y \`UK\` campos
únicos. Los campos compuestos y demás restricciones siguen teniendo como fuente de
verdad el esquema Prisma y sus migraciones. Para consultar obligatoriedad, valores
predeterminados y tipos de cada campo, usa el
[diccionario técnico](data-dictionary.md).

${diagrams}

## Relaciones entre áreas

Los modelos de identidad y catálogo son referenciados desde los documentos de compra,
salida, ajuste y merma. Para evitar repetir entidades y producir diagramas ilegibles,
cada diagrama anterior detalla las relaciones internas de su área y la vista siguiente
muestra sólo las asociaciones que cruzan esos límites. Los atributos permanecen en las
vistas por área y en el diccionario técnico.

\`\`\`mermaid
erDiagram
${crossAreaRelations.join('\n')}
\`\`\`

Consulta el esquema Prisma para las reglas \`onDelete\`/\`onUpdate\`. Una relación puede
aparecer con el nombre del campo inverso porque la vista se deriva de la relación Prisma;
la dirección de lectura no implica propiedad del proceso de negocio.
`;
};

const generateDataDictionary = async () => {
    const schema = await readFile(path.join(ROOT, 'prisma/schema.prisma'), 'utf8');
    const models = parsePrismaModels(schema);
    validateDatabaseAreas(models);
    const sections = DATABASE_AREAS.map(([title, names]) => (
        `## ${title}\n\n${names.map((name) => renderDataDictionaryModel(name, models.get(name))).join('\n\n')}`
    )).join('\n\n');
    const enums = parsePrismaEnums(schema)
        .map(({ name, values }) => `| \`${name}\` | ${values.map((value) => `\`${value}\``).join(', ')} |`)
        .join('\n');
    return `<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diccionario técnico de datos

Este inventario se genera desde \`prisma/schema.prisma\` y enumera campos escalares,
obligatoriedad, claves, valores predeterminados, tipos de base de datos y relaciones
propietarias. Se aplican las
[convenciones de diagramas](../architecture/diagram-conventions.md).

El tipo Prisma y el atributo \`@db\` describen la representación técnica. Prisma y las
migraciones son la fuente de verdad para restricciones completas, índices, acciones
referenciales y SQL. El propósito de negocio de los agregados se explica en el
[modelo de dominio y casos de uso](../requirements/domain-and-use-cases.md); este generador no inventa
definiciones de negocio a partir de nombres de tablas. La terminología compartida con
usuarios y responsables se mantiene en el
[glosario del negocio](../requirements/business-glossary.md).

## Cómo leerlo

- **Obligatorio** indica que el campo escalar no lleva \`?\` en Prisma; no sustituye las
  validaciones del caso de uso.
- **PK**, **FK** y **UK** significan clave primaria, foránea y única.
- Una relación listada es el lado que declara \`fields: [...]\`; las colecciones inversas
  se consultan en el esquema y en los diagramas ER.
- Los valores y tipos se presentan literalmente para que cualquier cambio produzca una
  diferencia revisable y verificable con \`npm run docs:check\`.

${sections}

## Enumeraciones

| Tipo | Valores permitidos por Prisma |
| --- | --- |
${enums}
`;
};

await validateUseCaseDiagramCoverage();

const contents = new Map([
    [OUTPUTS.codeMap, await generateCodeMap()],
    [OUTPUTS.database, await generateDatabaseSchema()],
    [OUTPUTS.dataDictionary, await generateDataDictionary()]
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
