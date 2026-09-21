import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { bundleOpenApiContract } from './openApiContractUtils.js';
import { prepareMermaidCli } from './prepareMermaidCli.js';
import {
    preparePdfConverter,
    preparePdfConverterEnvironment
} from './preparePdfConverter.js';

const ROOT = process.cwd();
const OPENAPI_SOURCE = 'docs/architecture/openapi/openapi.json';
const collectionGroups = [
    'authentication',
    'identity-access',
    'catalogs',
    'purchases',
    'issues'
];
const getDirectoryDocuments = (directory) => {
    const entries = readdirSync(path.join(ROOT, directory), { withFileTypes: true })
        .filter((entry) => entry.isDirectory() || entry.name.endsWith('.md'))
        .sort((left, right) => left.name.localeCompare(right.name));
    const chapters = entries.flatMap((entry) => {
        if (entry.name === 'index.md') return [];
        const source = `${directory}/${entry.name}`;
        return entry.isDirectory() ? getDirectoryDocuments(source) : [source];
    });
    return [`${directory}/index.md`, ...chapters];
};
const getCollectionDocuments = (base, groups) => [
    `${base}/index.md`,
    ...groups.flatMap((group) => getDirectoryDocuments(`${base}/${group}`))
];
const manualCaseGroups = [...collectionGroups, 'reports'];
const manualCases = Object.fromEntries(manualCaseGroups.map((group) => [
    group,
    getCollectionDocuments('docs/user-manual/cases', [group]).slice(1)
]));
const requirementUseCases = getCollectionDocuments('docs/requirements/use-cases', collectionGroups);
const requirementDiagrams = getCollectionDocuments(
    'docs/requirements/diagrams',
    [...collectionGroups, 'cross-cutting']
);
const manualOverview = 'docs/user-manual/overview.md';
const manualProcedures = 'docs/user-manual/procedures.md';
const manualErrorCatalog = 'docs/user-manual/error-messages.md';
const manualValidationMatrix = 'docs/user-manual/form-validation-matrix.md';
const manualPart = (actor, cases) => [
    actor,
    manualOverview,
    manualProcedures,
    ...cases,
    manualValidationMatrix,
    manualErrorCatalog
];
const manualCaseFiles = (group, names) => names.map((name) => (
    `docs/user-manual/cases/${group}/${name}`
));
const administrator = 'docs/user-manual/actors/administrator.md';
const warehouse = 'docs/user-manual/actors/warehouse.md';
const MANUALS = Object.freeze({
    'manual-administrador': {
        directory: 'manuales/administrador',
        parts: {
            autenticacion: manualPart(administrator, manualCases.authentication),
            'identidad-y-acceso': manualPart(administrator, manualCases['identity-access']),
            catalogos: manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalogs-auxiliary.md'
            ]))
        }
    },
    'manual-almacen': {
        directory: 'manuales/almacen',
        parts: {
            autenticacion: manualPart(warehouse, manualCases.authentication),
            catalogos: manualPart(warehouse, [
                ...manualCases.catalogs.slice(1),
                ...manualCases.reports
            ]),
            'compras-de-material': manualPart(warehouse, manualCases.purchases),
            'salidas-de-material': manualPart(warehouse, manualCaseFiles('issues', [
                '01-cap-sal-mat-01-list.md',
                '02-cap-sal-mat-02-create.md',
                '03-cap-sal-mat-03-edit.md',
                '04-cap-sal-mat-04-supply.md',
                '05-cap-sal-mat-05-return.md',
                '06-cap-rep-sal-mat-06-export.md',
                '07-cap-sal-mat-08-view.md'
            ])),
            'salidas-de-merma': manualPart(warehouse, manualCaseFiles('issues', [
                '08-cap-sal-was-01-list.md',
                '09-cap-sal-was-02-create.md',
                '10-cap-sal-was-03-edit.md',
                '11-cap-sal-was-04-supply.md',
                '12-cap-sal-was-05-return.md',
                '13-cap-rep-sal-was-06-export.md',
                '14-cap-sal-was-08-view.md'
            ]))
        }
    }
});
const sequenceGroups = [
    'authentication',
    'identity-access',
    'catalogs',
    'purchases',
    'issues',
    'reports'
];
const sequenceDocuments = (side) => getCollectionDocuments(
    `docs/architecture/${side}-code-sequences`,
    sequenceGroups
);
const MANIFESTS = Object.freeze({
    requisitos: [
        'docs/requirements/index.md',
        ...getDirectoryDocuments('docs/requirements/vision-scope-and-requirements'),
        ...getDirectoryDocuments('docs/requirements/requirements-specification'),
        ...getDirectoryDocuments('docs/requirements/domain-and-use-cases'),
        ...requirementUseCases,
        ...requirementDiagrams,
        'docs/requirements/requirements-operations-matrix.md',
        'docs/requirements/business-glossary.md'
    ],
    datos: [
        'docs/data/index.md',
        'docs/data/database-users-and-permissions-analysis.md',
        'docs/data/postgresql-runtime-and-migration-roles.md',
        'docs/generated/database-schema.md',
        'docs/generated/data-dictionary.md'
    ],
    arquitectura: [
        'docs/architecture/index.md',
        ...getDirectoryDocuments('docs/architecture/architecture-and-web-views'),
        ...getDirectoryDocuments('docs/architecture/web-navigation-and-screen-catalog'),
        ...getDirectoryDocuments('docs/architecture/technical-code-documentation'),
        ...getDirectoryDocuments('docs/architecture/backend-technical-documentation'),
        ...getDirectoryDocuments('docs/architecture/api-contract'),
        ...sequenceDocuments('backend'),
        ...getDirectoryDocuments('docs/architecture/frontend-technical-documentation'),
        ...sequenceDocuments('frontend'),
        ...getDirectoryDocuments('docs/architecture/traceability-matrix'),
        ...getDirectoryDocuments('docs/architecture/design-and-construction-patterns'),
        ...getDirectoryDocuments('docs/architecture/code-diagrams'),
        'docs/generated/code-map.md',
        ...getDirectoryDocuments('docs/architecture/diagram-conventions'),
        ...getDirectoryDocuments('docs/architecture/diagram-inventory'),
        ...getDirectoryDocuments('docs/architecture/coding-standards'),
        'docs/architecture/decisions/index.md',
        'docs/architecture/decisions/ADR-001-sequences-by-perspective-and-group.md'
    ],
    pruebas: [
        'docs/testing/test-plan.md',
        'docs/testing/service-test-coverage.md',
        'docs/testing/unit-test-catalog.md',
        'docs/testing/unit-test-results.md'
    ]
});
const [requestedPublication, requestedFormat] = process.argv.slice(2).filter((argument) => argument !== '--check');
const checkOnly = process.argv.includes('--check');
const formats = new Set(['docx', 'pdf', 'ambos']);
const outputFormat = requestedFormat === 'ambos' ? 'pdf' : requestedFormat;
let pdfConverter = process.env.DOCS_PDF_CONVERTER;
const publicationNames = [...Object.keys(MANUALS), ...Object.keys(MANIFESTS)];
const mermaidBlock = /^```mermaid\r?\n([\s\S]*?)^```\r?$/gm;
const externalLink = /^(?:https?:|mailto:)/;
const markdownLink = /(?<!!)\[([^\]]+)\]\(([^) ]+)([^)]*)\)/g;
const documentDataHeading = /^## Datos generales del documento$/m;
const documentDataTable = [
    '\\| Versión documental \\| Versión del sistema \\| Estado \\| Fecha \\| Responsable \\|',
    '\\| --- \\| --- \\| --- \\| --- \\| --- \\|',
    '\\| [^\\r\\n]+ \\|'
].join('\\r?\\n');
const documentDataAtStart = new RegExp(
    `^# [^\\r\\n]+\\r?\\n\\r?\\n## Datos generales del documento\\r?\\n\\r?\\n${documentDataTable}$`,
    'm'
);
const preparedDocumentData = new RegExp(
    `^## Datos generales del documento(?: \\{#[^}]+\\})?\\r?\\n\\r?\\n${documentDataTable}$`,
    'm'
);
const documentAnchor = (source, fragment) => [
    'documento',
    source.replace(/\.md$/, '').replace(/[^\p{L}\p{N}]+/gu, '-'),
    fragment
].filter(Boolean).join('-').toLowerCase();
const headingFragment = (title) => title
    .replace(/[`*_\[\]]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .replace(/[ _]/g, '-');
const getDocumentFragments = (content) => new Set([
    ...[...content.matchAll(/^<a id="([^"]+)"><\/a>$/gm)].map((match) => match[1]),
    ...[...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => headingFragment(match[1]))
]);
const normalizeMermaidSource = (source) => {
    const content = source.replace(/\r?\n$/, '');
    return !content.includes('\n') && content.includes('\\n')
        ? `${content.replace(/\\r\\n|\\n/g, '\n')}\n`
        : source;
};
const diagramCaption = (content, index) => {
    const headings = [...content.slice(0, index).matchAll(/^#{1,6}\s+(.+)$/gm)];
    const heading = headings.at(-1)?.[1].replace(/[`[*_\]]/g, '').trim();
    if (!heading) throw new Error('Cada bloque Mermaid debe estar declarado bajo un encabezado Markdown.');
    return `Diagrama — ${heading}`;
};

const prepareLinks = (content, source, publicationSources) => content.replace(
    markdownLink,
    (reference, label, link, suffix) => {
        if (externalLink.test(link)) return reference;
        if (link.startsWith('#')) {
            return `[${label}](#${documentAnchor(source, link.slice(1))}${suffix})`;
        }
        const [target, fragment] = link.split('#');
        const resolvedTarget = path.relative(
            ROOT,
            path.resolve(ROOT, path.dirname(source), target)
        ).split(path.sep).join('/');
        return target.endsWith('.md') && publicationSources.has(resolvedTarget)
            ? `[${label}](#${documentAnchor(resolvedTarget, fragment)}${suffix})`
            : label;
    }
);

const addInternalAnchors = (content, source) => {
    const anchorOccurrences = new Map();
    const uniqueDocumentAnchor = (fragment) => {
        const anchor = documentAnchor(source, fragment);
        const occurrence = (anchorOccurrences.get(anchor) ?? 0) + 1;
        anchorOccurrences.set(anchor, occurrence);
        return occurrence === 1 ? anchor : `${anchor}-${occurrence}`;
    };
    const anchoredAliases = content.replace(
        /^<a id="([^"]+)"><\/a>$/gm,
        (anchor, fragment) => `[]{#${uniqueDocumentAnchor(fragment)}}\n`
    );
    const anchoredHeadings = anchoredAliases.replace(
        /^(#{1,6})\s+(.+)$/gm,
        (heading, level, title) => `${level} ${title} {#${uniqueDocumentAnchor(headingFragment(title))}}`
    );
    return `[]{#${documentAnchor(source)}}\n\n${anchoredHeadings}`;
};

const addFigureAnchors = (content, source, firstFigureNumber) => {
    let figureNumber = firstFigureNumber;
    return content.replace(
        /^(\s*)(!\[([^\]]+)\]\([^)]+\))$/gm,
        (figure, indentation, image, title) => (
            `${indentation}${image.replace(`![${title}]`, `![Figura ${figureNumber}. ${title}]`)}`
            + `{#${documentAnchor(source, `figura-${figureNumber++}`)}}`
        )
    );
};

const buildDocumentIndexes = async (preparedSources) => {
    const headings = [];
    const figures = [];
    for (const preparedSource of preparedSources) {
        const content = await readFile(preparedSource, 'utf8');
        headings.push(...[...content.matchAll(/^(#{1,6})\s+(.+?)\s+\{#([^}]+)\}$/gm)].map((match) => ({
            level: match[1].length,
            title: match[2],
            link: `#${match[3]}`
        })).filter(({ level }) => level <= 3));
        figures.push(...[...content.matchAll(/^\s*!\[([^\]]+)\]\([^)]+\)\{#([^}]+)\}$/gm)].map((match) => ({
            title: match[1],
            link: `#${match[2]}`
        })));
    }
    const tableOfContents = headings.map(({ level, title, link }) => (
        `${'    '.repeat(level - 1)}- [${title}](${link})`
    ));
    const listOfFigures = figures.map(({ title, link }) => `- [${title}](${link})`);
    return [
        '## Tabla de contenido',
        '',
        ...tableOfContents,
        ...(listOfFigures.length ? [
            '',
            '## Índice de imágenes',
            '',
            ...listOfFigures
        ] : []),
        ''
    ].join('\n');
};

const insertAfterDocumentData = (content, insertion) => {
    const documentData = content.match(preparedDocumentData);
    if (!documentData) throw new Error('La entrada del paquete no contiene una tabla de datos generales válida.');
    const insertionIndex = documentData.index + documentData[0].length;
    return `${content.slice(0, insertionIndex)}\n\n${insertion}\n${content.slice(insertionIndex).replace(/^\r?\n+/, '')}`;
};

if ((requestedPublication !== 'todos' && !MANIFESTS[requestedPublication] && !MANUALS[requestedPublication])
    || (checkOnly ? requestedFormat && !formats.has(requestedFormat) : !formats.has(requestedFormat))) {
    console.error('Uso: npm run docs:export -- <todos|manual-administrador|manual-almacen|requisitos|datos|arquitectura|pruebas> [docx|pdf|ambos] [--check]');
    process.exit(1);
}

const requestedPublications = requestedPublication === 'todos' ? publicationNames : [requestedPublication];
const publicationParts = requestedPublications.flatMap((publication) => {
    const manual = MANUALS[publication];
    if (!manual) return [{ publication, document: publication, sources: MANIFESTS[publication] }];
    return Object.entries(manual.parts).map(([document, sources]) => ({
        publication,
        document,
        directory: manual.directory,
        sources
    }));
});
const publications = await Promise.all(publicationParts.map(async ({ publication, document, directory, sources }) => {
    await Promise.all(sources.map((source) => access(path.join(ROOT, source))));
    const sourceContents = await Promise.all(sources.map(async (source) => ({
        source,
        content: await readFile(path.join(ROOT, source), 'utf8')
    })));
    const [entry, ...chapters] = sourceContents;
    if (!documentDataAtStart.test(entry.content)) {
        throw new Error(`La entrada ${entry.source} debe declarar la tabla de datos generales inmediatamente después del título.`);
    }
    const chapterWithDocumentData = chapters.find(({ content }) => documentDataHeading.test(content));
    if (chapterWithDocumentData) {
        throw new Error(`La tabla de datos generales pertenece sólo a la entrada del paquete, no a ${chapterWithDocumentData.source}.`);
    }
    const contentsBySource = new Map(sourceContents.map(({ source, content }) => [source, content]));
    for (const { source, content } of sourceContents) {
        for (const match of content.matchAll(mermaidBlock)) {
            try {
                diagramCaption(content, match.index);
            } catch (error) {
                throw new Error(`${error.message} Fuente: ${source}.`);
            }
        }
    }
    const imageReferences = sourceContents.flatMap(({ source, content }) => (
        [...content.matchAll(/!\[([^\]]*)\]\(([^) ]+)/g)].map((match) => ({ source, alternative: match[1].trim(), image: match[2] }))
    ));
    const linkReferences = sourceContents.flatMap(({ source, content }) => (
        [...content.matchAll(/(?<!!)\[[^\]]*\]\(([^) ]+)/g)].map((match) => ({ source, link: match[1] }))
    ));
    for (const { source, alternative, image } of imageReferences) {
        if (!alternative) throw new Error(`La imagen ${image} de ${source} debe declarar texto alternativo.`);
        if (path.isAbsolute(image) || externalLink.test(image)) {
            throw new Error(`La imagen ${image} de ${source} debe usar una ruta relativa.`);
        }
    }
    await Promise.all(imageReferences.map(({ source, image }) => (
        access(path.resolve(ROOT, path.dirname(source), image))
    )));
    await Promise.all(linkReferences.map(({ source, link }) => {
        if (link.startsWith('#') || externalLink.test(link)) return null;
        if (path.isAbsolute(link)) throw new Error(`El enlace local ${link} de ${source} debe usar una ruta relativa.`);
        const [target] = link.split('#');
        return target ? access(path.resolve(ROOT, path.dirname(source), target)) : null;
    }));
    for (const { source, link } of linkReferences) {
        if (externalLink.test(link)) continue;
        const [target, fragment] = link.split('#');
        if (!fragment) continue;
        const resolvedTarget = target
            ? path.relative(ROOT, path.resolve(ROOT, path.dirname(source), target)).split(path.sep).join('/')
            : source;
        if (!resolvedTarget.endsWith('.md')) continue;
        const targetContent = contentsBySource.get(resolvedTarget)
            ?? await readFile(path.join(ROOT, resolvedTarget), 'utf8');
        if (!getDocumentFragments(targetContent).has(decodeURIComponent(fragment))) {
            throw new Error(`El enlace ${link} de ${source} no corresponde a un título o ancla de ${resolvedTarget}.`);
        }
    }
    return { publication, document, directory, sources, imageReferences };
}));

if (checkOnly) {
    for (const { publication, document, sources, imageReferences } of publications) {
        console.log(`Paquete ${publication}/${document}: ${sources.length} fuentes y ${imageReferences.length} imágenes válidas.`);
    }
    process.exit(0);
}

const pandoc = spawnSync('pandoc', ['--version'], { encoding: 'utf8' });
if (pandoc.error || pandoc.status !== 0) {
    console.error('Pandoc no está disponible. Instálalo o usa --check para validar las fuentes.');
    process.exit(1);
}
if (outputFormat === 'pdf') {
    try {
        pdfConverter = preparePdfConverter({ configuredConverter: pdfConverter });
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

const outputDirectory = path.join(ROOT, 'build/docs');
const documentOutputDirectories = {
    docx: path.join(outputDirectory, 'docx'),
    pdf: path.join(outputDirectory, 'pdf')
};
await mkdir(outputDirectory, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(outputDirectory, '.export-'));
const diagramOutputDirectory = path.join(outputDirectory, 'diagrams');
const diagramSourceDirectory = path.join(outputDirectory, 'diagram-sources');
const openApiOutputDirectory = path.join(outputDirectory, 'openapi');
await Promise.all([
    ...Object.values(documentOutputDirectories).map((directory) => mkdir(directory, { recursive: true })),
    mkdir(diagramOutputDirectory, { recursive: true }),
    mkdir(diagramSourceDirectory, { recursive: true }),
    mkdir(openApiOutputDirectory, { recursive: true })
]);
const mermaidExecutable = path.join(ROOT, 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js');

const prepareSource = async (source, publicationSources, firstFigureNumber) => {
    const content = await readFile(path.join(ROOT, source), 'utf8');
    const blocks = [...content.matchAll(mermaidBlock)];

    const renderedSource = path.join(temporaryDirectory, source);
    await mkdir(path.dirname(renderedSource), { recursive: true });
    let renderedContent = addInternalAnchors(prepareLinks(content, source, publicationSources), source).replace(/(!\[[^\]]*\]\()([^) ]+)/g, (reference, prefix, image) => (
        `${prefix}${path.resolve(ROOT, path.dirname(source), image)}`
    ));
    for (const match of blocks) {
        const diagram = normalizeMermaidSource(match[1]);
        const id = createHash('sha256').update(diagram).digest('hex').slice(0, 16);
        const input = path.join(diagramSourceDirectory, `${id}.mmd`);
        const image = path.join(diagramOutputDirectory, `${id}.png`);
        await writeFile(input, diagram);
        if (!existsSync(image)) {
            try {
                prepareMermaidCli({ executable: mermaidExecutable });
            } catch (error) {
                console.error(error.message);
                return null;
            }
            const result = spawnSync(process.execPath, [mermaidExecutable, '--input', input, '--output', image, '--backgroundColor', 'white', '--scale', '2'], { cwd: ROOT, stdio: 'inherit' });
            if (result.error?.code === 'ENOENT') {
                await rm(image, { force: true });
                console.error('Mermaid CLI no pudo ejecutarse después de preparar la dependencia.');
                return null;
            }
            if (result.status !== 0) {
                await rm(image, { force: true });
                return null;
            }
        }
        renderedContent = renderedContent.replace(match[0], `![${diagramCaption(content, match.index)}](${image})`);
    }
    renderedContent = addFigureAnchors(renderedContent, source, firstFigureNumber);
    await writeFile(renderedSource, renderedContent);
    return {
        renderedSource,
        nextFigureNumber: firstFigureNumber
            + [...renderedContent.matchAll(/^\s*!\[[^\]]+\]\([^)]+\)\{#[^}]+\}$/gm)].length
    };
};

let failedStatus = 0;
try {
    for (const { publication, document, directory, sources } of publications) {
        const relativeOutput = directory ? path.join(directory, `${document}.${outputFormat}`) : `${document}.${outputFormat}`;
        const relativeDocxOutput = directory ? path.join(directory, `${document}.docx`) : `${document}.docx`;
        const output = path.join(documentOutputDirectories[outputFormat], relativeOutput);
        const docxOutput = path.join(documentOutputDirectories.docx, relativeDocxOutput);
        await Promise.all([
            mkdir(path.dirname(output), { recursive: true }),
            mkdir(path.dirname(docxOutput), { recursive: true })
        ]);
        await rm(output, { force: true });
        if (outputFormat === 'pdf') await rm(docxOutput, { force: true });
        const preparedSources = [];
        const publicationSources = new Set(sources);
        let nextFigureNumber = 1;
        for (const source of sources) {
            const prepared = await prepareSource(source, publicationSources, nextFigureNumber);
            if (!prepared) {
                failedStatus = 1;
                break;
            }
            preparedSources.push(prepared.renderedSource);
            nextFigureNumber = prepared.nextFigureNumber;
        }
        if (failedStatus) break;

        const firstSource = preparedSources[0];
        const firstContent = await readFile(firstSource, 'utf8');
        const indexes = await buildDocumentIndexes(preparedSources);
        await writeFile(firstSource, insertAfterDocumentData(firstContent, indexes));

        const scopedSources = preparedSources.map((source) => path.relative(temporaryDirectory, source));
        const args = [
            ...scopedSources,
            '--from=markdown+header_attributes+implicit_figures',
            '--standalone',
            '--metadata=lang:es-MX',
            `--output=${docxOutput}`,
            `--resource-path=${[ROOT, path.join(ROOT, 'docs')].join(path.delimiter)}`
        ];
        if (process.env.DOCS_REFERENCE_DOC) args.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
        const result = spawnSync('pandoc', args, { cwd: temporaryDirectory, stdio: 'inherit' });
        if (result.status !== 0) {
            failedStatus = result.status ?? 1;
            break;
        }
        if (outputFormat === 'pdf') {
            console.log(`Documento intermedio generado en ${path.relative(ROOT, docxOutput)}.`);
            const conversion = spawnSync(pdfConverter, [
                `-env:UserInstallation=${pathToFileURL(path.join(temporaryDirectory, 'libreoffice-profile')).href}`,
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                path.dirname(output),
                docxOutput
            ], {
                cwd: ROOT,
                env: preparePdfConverterEnvironment(),
                stdio: 'inherit',
                windowsHide: true
            });
            if (conversion.status !== 0 || !existsSync(output)) {
                console.error(`No se pudo convertir ${path.relative(ROOT, docxOutput)} a PDF con ${pdfConverter}.`);
                failedStatus = conversion.status ?? 1;
                break;
            }
        }
        if (publication === 'arquitectura') {
            const openApiOutput = path.join(openApiOutputDirectory, 'openapi.json');
            const openApiContract = await bundleOpenApiContract(path.join(ROOT, OPENAPI_SOURCE));
            await writeFile(openApiOutput, `${JSON.stringify(openApiContract, null, 2)}\n`);
            console.log(`Contrato OpenAPI exportado en ${path.relative(ROOT, openApiOutput)}.`);
        }
        console.log(`Documento generado en ${path.relative(ROOT, output)}.`);
    }
} finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
}
if (failedStatus) process.exit(failedStatus);
