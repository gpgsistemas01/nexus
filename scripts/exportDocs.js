import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { bundleOpenApiContract } from './openApiContractUtils.js';
import { getDocumentExportRequest, getDocumentOutputPlan } from './documentExportFormats.js';
import { getFigureSizeAttribute, getPngDimensions } from './documentExportImageUtils.js';
import {
    documentExportAnchor,
    externalDocumentAnchorFragment,
    externalDocumentLinkLabel,
    prepareManualEntry
} from './documentExportContentUtils.js';
import { removeDocumentOutput } from './documentOutputUtils.js';
import { prepareMermaidCli } from './prepareMermaidCli.js';
import { getMermaidImageId, hasInvalidSvgGeometry, MERMAID_EXPORT_CONFIG, normalizeMermaidSource } from './mermaidExportUtils.js';
import { validatePdfOutput } from './pdfExportUtils.js';
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
const manualOverview = 'docs/user-manual/overview.md';
const manualProcedures = 'docs/user-manual/procedures.md';
const manualErrorCatalog = 'docs/user-manual/error-messages.md';
const manualValidationMatrix = 'docs/user-manual/form-validation-matrix.md';
const manualPart = (actor, cases) => [
    actor,
    ...cases
];
const manualAdditionalPart = (actor) => [
    actor,
    manualOverview,
    manualProcedures,
    manualValidationMatrix,
    manualErrorCatalog
];
const manualCaseFiles = (group, names) => names.map((name) => (
    `docs/user-manual/cases/${group}/${name}`
));
const consumableIssueManualCases = [
    ...manualCaseFiles('issues', ['15-cap-sal-con-01-walkthrough.md']),
    ...manualCaseFiles('catalogs', ['11-cap-cat-cli-02-create.md'])
];
const administrator = 'docs/user-manual/actors/administrator.md';
const warehouse = 'docs/user-manual/actors/warehouse.md';
const MANUALS = Object.freeze({
    'manual-administrador': {
        directory: 'manuales/administrador',
        parts: {
            'informacion-general-y-anexos': manualAdditionalPart(administrator),
            autenticacion: manualPart(administrator, manualCases.authentication),
            'salidas-consumibles': manualPart(administrator, consumableIssueManualCases),
            'movimientos-materiales': manualPart(administrator, manualCaseFiles('reports', [
                '01-cap-rep-mov-mat-01-list.md',
                '02-cap-rep-mov-mat-02-export.md'
            ])),
            'movimientos-mermas': manualPart(administrator, manualCaseFiles('reports', [
                '03-cap-rep-mov-was-01-list.md',
                '04-cap-rep-mov-was-02-export.md'
            ])),
            usuarios: manualPart(administrator, manualCaseFiles('identity-access', [
                '04-cap-ida-usr-01-list.md',
                '05-cap-ida-usr-02-create.md',
                '06-cap-ida-usr-03-edit.md',
                '07-cap-ida-usr-04-password.md'
            ])),
            'catalogo-areas': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-areas.md'
            ])),
            'catalogo-roles': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-roles.md'
            ])),
            'catalogo-presentaciones': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-presentations.md'
            ])),
            'catalogo-unidades-medida': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-unit-measures.md'
            ])),
            'catalogo-motivos-ajuste': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-adjustment-reasons.md'
            ])),
            'catalogo-estados-cumplimiento': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-fulfillment-statuses.md'
            ])),
            personas: manualPart(administrator, manualCaseFiles('identity-access', [
                '01-cap-ida-per-01-list.md',
                '02-cap-ida-per-02-create.md',
                '03-cap-ida-per-03-edit.md'
            ])),
            clientes: manualPart(administrator, manualCaseFiles('catalogs', [
                '10-cap-cat-cli-01-list.md',
                '11-cap-cat-cli-02-create.md',
                '12-cap-cat-cli-03-edit.md'
            ])),
            proveedores: manualPart(administrator, manualCaseFiles('catalogs', [
                '07-cap-cat-sup-01-list.md',
                '08-cap-cat-sup-02-create.md',
                '09-cap-cat-sup-03-edit.md'
            ]))
        }
    },
    'manual-almacen': {
        directory: 'manuales/almacen',
        parts: {
            'informacion-general-y-anexos': manualAdditionalPart(warehouse),
            autenticacion: manualPart(warehouse, manualCases.authentication),
            'almacen-materiales': manualPart(warehouse, manualCaseFiles('catalogs', [
                '02-cap-cat-mat-01-list.md',
                '03-cap-cat-mat-02-create.md',
                '04-cap-cat-mat-03-edit.md',
                '05-cap-cat-mat-04-stock.md',
                '06-cap-rep-mat-05-export.md'
            ])),
            'almacen-consumibles': manualPart(warehouse, manualCaseFiles('catalogs', [
                '19-cap-cat-con-01-list.md',
                '20-cap-cat-con-02-create.md',
                '21-cap-cat-con-03-edit.md',
                '22-cap-cat-con-04-remove.md',
                '23-cap-cat-con-05-stock.md',
                '24-cap-rep-con-06-export.md'
            ])),
            'almacen-mermas': manualPart(warehouse, manualCaseFiles('catalogs', [
                '13-cap-cat-was-01-list.md',
                '14-cap-cat-was-02-create.md',
                '15-cap-cat-was-03-edit.md',
                '16-cap-cat-was-04-stock.md',
                '17-cap-cat-was-05-add-stock.md',
                '18-cap-rep-was-05-export.md'
            ])),
            compras: manualPart(warehouse, [
                ...manualCases.purchases,
                ...manualCaseFiles('catalogs', ['08-cap-cat-sup-02-create.md'])
            ]),
            'salidas-materiales': manualPart(warehouse, [
                ...manualCaseFiles('issues', [
                    '01-cap-sal-mat-01-list.md',
                    '02-cap-sal-mat-02-create.md',
                    '03-cap-sal-mat-03-edit.md',
                    '04-cap-sal-mat-04-supply.md',
                    '05-cap-sal-mat-05-return.md',
                    '06-cap-rep-sal-mat-06-export.md',
                    '07-cap-sal-mat-08-view.md'
                ]),
                ...manualCaseFiles('catalogs', ['11-cap-cat-cli-02-create.md'])
            ]),
            'salidas-consumibles': manualPart(warehouse, consumableIssueManualCases),
            'salidas-mermas': manualPart(warehouse, [
                ...manualCaseFiles('issues', [
                    '08-cap-sal-was-01-list.md',
                    '09-cap-sal-was-02-create.md',
                    '10-cap-sal-was-03-edit.md',
                    '11-cap-sal-was-04-supply.md',
                    '12-cap-sal-was-05-return.md',
                    '13-cap-rep-sal-was-06-export.md',
                    '14-cap-sal-was-08-view.md'
                ]),
                ...manualCaseFiles('catalogs', ['11-cap-cat-cli-02-create.md'])
            ])
        }
    }
});
const sequenceGroups = [
    'authentication',
    'identity-access',
    'catalogs',
    'purchases',
    'issues'
];
const packagePart = (entry, sources) => [entry, ...sources.filter((source) => source !== entry)];
const REQUIREMENT_ENTRY = 'docs/requirements/index.md';
const ARCHITECTURE_ENTRY = 'docs/architecture/index.md';
const PUBLICATIONS = Object.freeze({
    requisitos: {
        directory: 'requisitos',
        parts: {
            'vision-y-alcance': packagePart(REQUIREMENT_ENTRY, [
                ...getDirectoryDocuments('docs/requirements/vision-scope-and-requirements')
            ]),
            especificacion: packagePart(REQUIREMENT_ENTRY, [
                ...getDirectoryDocuments('docs/requirements/requirements-specification'),
                'docs/requirements/business-glossary.md'
            ]),
            'dominio-y-casos-de-uso': packagePart(REQUIREMENT_ENTRY, [
                ...getDirectoryDocuments('docs/requirements/domain-and-use-cases')
            ]),
            ...Object.fromEntries(collectionGroups.map((group) => [
                `casos-de-uso-${group}`,
                packagePart(REQUIREMENT_ENTRY, getCollectionDocuments('docs/requirements/use-cases', [group]))
            ]))
        }
    },
    datos: {
        parts: {
            datos: [
                'docs/architecture/views/logical/data-and-persistence/index.md',
                'docs/architecture/views/logical/data-and-persistence/generated/database-schema.md',
                'docs/architecture/views/logical/data-and-persistence/generated/data-dictionary.md'
            ]
        }
    },
    arquitectura: {
        directory: 'arquitectura',
        parts: {
            'vision-y-navegacion': packagePart(ARCHITECTURE_ENTRY, [
                'docs/architecture/views/index.md',
                'docs/architecture/views/scenarios/index.md',
                'docs/requirements/domain-and-use-cases/02-current-use-cases.md',
                ...getDirectoryDocuments('docs/architecture/views/scenarios/web-navigation-and-screen-catalog'),
                'docs/architecture/views/logical/index.md',
                'docs/architecture/views/logical/01-components-and-reuse.md',
                'docs/architecture/views/logical/02-identity-access-and-audit.md',
                'docs/architecture/views/physical/index.md',
                'docs/architecture/views/physical/01-system-runtime-and-deployment.md',
                'docs/architecture/views/physical/02-postgresql-runtime-and-migration-roles.md'
            ]),
            'patrones-y-mapa-de-codigo': packagePart(ARCHITECTURE_ENTRY, [
                ...getDirectoryDocuments('docs/architecture/views/development/design-and-construction-patterns'),
                ...getDirectoryDocuments('docs/architecture/views/development/code-diagrams'),
                'docs/architecture/views/development/code-map.md'
            ]),
            backend: packagePart(ARCHITECTURE_ENTRY, [
                ...getDirectoryDocuments('docs/architecture/views/development/backend-technical-documentation')
            ]),
            frontend: packagePart(ARCHITECTURE_ENTRY, [
                ...getDirectoryDocuments('docs/architecture/views/development/frontend-technical-documentation')
            ]),
            'contrato-api': packagePart(ARCHITECTURE_ENTRY, [
                'docs/architecture/openapi/api-contract.md'
            ]),
            estandar: packagePart(ARCHITECTURE_ENTRY, [
                ...getDirectoryDocuments('docs/architecture/coding-standards')
            ]),
            ...Object.fromEntries(sequenceGroups.flatMap((group) => ['backend', 'frontend'].map((side) => [
                `secuencias-${side}-${group}`,
                packagePart(ARCHITECTURE_ENTRY, getCollectionDocuments(
                    `docs/architecture/views/processes/${side}-code-sequences`,
                    [group]
                ))
            ])))
        }
    },
    pruebas: {
        parts: {
            pruebas: [
                'docs/testing/test-plan.md',
                'docs/testing/automated-test-case-index.md',
                'docs/testing/use-case-test-types.md'
            ]
        }
    }
});
const {
    publication: requestedPublication,
    document: requestedDocument,
    format: requestedFormat,
    checkOnly
} = getDocumentExportRequest(process.argv.slice(2));
const formats = new Set(['docx', 'pdf', 'ambos']);
const outputPlan = getDocumentOutputPlan(requestedFormat);
const positionalArgumentCount = process.argv.slice(2)
    .filter((argument) => argument !== '--check').length;
let pdfConverter = process.env.DOCS_PDF_CONVERTER;
const manualNames = Object.keys(MANUALS);
const publicationNames = [...manualNames, ...Object.keys(PUBLICATIONS)];
const selectablePublicationNames = ['manuales', ...Object.keys(PUBLICATIONS)];
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
const diagramCaption = (content, index) => {
    const headings = [...content.slice(0, index).matchAll(/^#{1,6}\s+(.+)$/gm)];
    const heading = headings.at(-1)?.[1].replace(/[`[*_\]]/g, '').trim();
    if (!heading) throw new Error('Cada bloque Mermaid debe estar declarado bajo un encabezado Markdown.');
    return `Diagrama — ${heading}`;
};

const prepareLinks = (
    content,
    source,
    publicationSources,
    linkedOutputs,
    sourceContents,
    currentOutput,
    outputFormat
) => content.replace(
    markdownLink,
    (reference, label, link, suffix) => {
        if (externalLink.test(link)) return reference;
        if (link.startsWith('#')) {
            return `[${label}](#${documentExportAnchor(source, link.slice(1))}${suffix})`;
        }
        const [target, fragment] = link.split('#');
        const resolvedTarget = path.relative(
            ROOT,
            path.resolve(ROOT, path.dirname(source), target)
        ).split(path.sep).join('/');
        if (target.endsWith('.md') && publicationSources.has(resolvedTarget)) {
            return `[${label}](#${documentExportAnchor(resolvedTarget, fragment)}${suffix})`;
        }
        const outputCandidates = linkedOutputs.get(resolvedTarget) ?? [];
        const linkedOutput = outputCandidates.find(output => path.dirname(output) === path.dirname(currentOutput))
            ?? (outputCandidates.length === 1 ? outputCandidates[0] : null);
        if (!target.endsWith('.md') || !linkedOutput) return label;
        const relativeOutput = path.relative(
            path.dirname(currentOutput),
            linkedOutput.replace(/\.docx$/, `.${ outputFormat }`)
        ).split(path.sep).join('/');
        const externalDocumentLabel = externalDocumentLinkLabel({
            linkedOutput,
            fragment,
            targetContent: sourceContents.get(resolvedTarget)
        });
        const externalAnchorFragment = externalDocumentAnchorFragment({
            fragment,
            targetContent: sourceContents.get(resolvedTarget)
        });
        const externalAnchor = externalAnchorFragment
            ? `#${documentExportAnchor(resolvedTarget, externalAnchorFragment)}`
            : '';
        return `[${externalDocumentLabel}](${relativeOutput}${externalAnchor}${suffix})`;
    }
);

const addInternalAnchors = (content, source) => {
    const anchorOccurrences = new Map();
    const uniqueDocumentAnchor = (fragment) => {
        const anchor = documentExportAnchor(source, fragment);
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
    return `[]{#${documentExportAnchor(source)}}\n\n${anchoredHeadings}`;
};

const addFigureAnchors = async (content, source, firstFigureNumber) => {
    let figureNumber = firstFigureNumber;
    const figurePattern = /^(\s*)(!\[([^\]]+)\]\(([^)]+)\))$/gm;
    const figures = [...content.matchAll(figurePattern)];
    let preparedContent = content;
    for (const [figure, indentation, image, title, imagePath] of figures) {
        const dimensions = getPngDimensions(await readFile(imagePath));
        const replacement = `${indentation}${image.replace(`![${title}]`, `![Figura ${figureNumber}. ${title}]`)}`
            + `{#${documentExportAnchor(source, `figura-${figureNumber++}`)} ${getFigureSizeAttribute(dimensions)}}`;
        preparedContent = preparedContent.replace(figure, replacement);
    }
    return preparedContent;
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
        figures.push(...[...content.matchAll(/^\s*!\[([^\]]+)\]\([^)]+\)\{#([^ }]+)[^}]*\}$/gm)].map((match) => ({
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

const selectedDefinition = PUBLICATIONS[requestedPublication];
const invalidDocument = requestedDocument && (
    !selectedDefinition?.parts[requestedDocument]
    || requestedPublication === 'todos'
    || requestedPublication === 'manuales'
);
if ((requestedPublication !== 'todos' && !selectablePublicationNames.includes(requestedPublication))
    || invalidDocument
    || positionalArgumentCount > 3
    || (checkOnly ? requestedFormat && !formats.has(requestedFormat) : !formats.has(requestedFormat))) {
    console.error('Uso: npm run docs:export -- [todos|manuales|requisitos|datos|arquitectura|pruebas] [seccion] [docx|pdf|ambos] [--check]');
    process.exit(1);
}

const requestedPublications = requestedPublication === 'todos'
    ? publicationNames
    : requestedPublication === 'manuales' ? manualNames : [requestedPublication];
const publicationParts = requestedPublications.flatMap((publication) => {
    const definition = MANUALS[publication] ?? PUBLICATIONS[publication];
    const parts = requestedDocument
        ? [[requestedDocument, definition.parts[requestedDocument]]]
        : Object.entries(definition.parts);
    return parts.map(([document, sources]) => ({
        publication,
        document,
        directory: definition.directory,
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

const sourceContents = new Map((await Promise.all(
    [...new Set(publications.flatMap(({ sources }) => sources))].map(async (source) => [
        source,
        await readFile(path.join(ROOT, source), 'utf8')
    ])
)));

const linkedOutputs = new Map();
for (const { document, directory, sources } of publications) {
    const output = directory ? path.join(directory, `${document}.docx`) : `${document}.docx`;
    for (const source of sources) {
        const outputs = linkedOutputs.get(source) ?? [];
        if (!outputs.includes(output)) outputs.push(output);
        linkedOutputs.set(source, outputs);
    }
}

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
if (outputPlan.generatePdf) {
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
const mermaidConfigFile = path.join(temporaryDirectory, 'mermaid-config.json');
await writeFile(mermaidConfigFile, JSON.stringify(MERMAID_EXPORT_CONFIG));
let mermaidPrepared = false;

const prepareSource = async (source, publicationSources, firstFigureNumber, currentOutput, outputFormat) => {
    const sourceContent = await readFile(path.join(ROOT, source), 'utf8');
    const content = source.startsWith('docs/user-manual/actors/')
        ? prepareManualEntry(sourceContent, currentOutput)
        : sourceContent;
    const blocks = [...content.matchAll(mermaidBlock)];
    if (blocks.length && !mermaidPrepared) {
        try {
            prepareMermaidCli({ executable: mermaidExecutable });
            mermaidPrepared = true;
        } catch (error) {
            console.error(error.message);
            return null;
        }
    }

    const renderedSource = path.join(temporaryDirectory, source);
    await mkdir(path.dirname(renderedSource), { recursive: true });
    let renderedContent = addInternalAnchors(prepareLinks(
        content,
        source,
        publicationSources,
        linkedOutputs,
        sourceContents,
        currentOutput,
        outputFormat
    ), source).replace(/(!\[[^\]]*\]\()([^) ]+)/g, (reference, prefix, image) => (
        `${prefix}${path.resolve(ROOT, path.dirname(source), image)}`
    ));
    for (const match of blocks) {
        const diagram = normalizeMermaidSource(match[1]);
        const id = getMermaidImageId(diagram);
        const input = path.join(diagramSourceDirectory, `${id}.mmd`);
        const image = path.join(diagramOutputDirectory, `${id}.png`);
        const validationMarker = path.join(diagramOutputDirectory, `${id}.validated`);
        await writeFile(input, diagram);
        if (!existsSync(image) || !existsSync(validationMarker)) {
            await Promise.all([
                rm(image, { force: true }),
                rm(validationMarker, { force: true })
            ]);
            const mermaidArguments = [mermaidExecutable, '--input', input, '--output', image,
                '--configFile', mermaidConfigFile, '--backgroundColor', 'white', '--scale', '2'];
            if (process.env.DOCS_MERMAID_PUPPETEER_CONFIG) {
                mermaidArguments.push('--puppeteerConfigFile', process.env.DOCS_MERMAID_PUPPETEER_CONFIG);
            }
            const result = spawnSync(process.execPath, mermaidArguments, { cwd: ROOT, encoding: 'utf8' });
            if (result.stdout) process.stdout.write(result.stdout);
            if (result.stderr) process.stderr.write(result.stderr);
            if (result.error?.code === 'ENOENT') {
                await Promise.all([
                    rm(image, { force: true }),
                    rm(validationMarker, { force: true })
                ]);
                console.error('Mermaid CLI no pudo ejecutarse después de preparar la dependencia.');
                return null;
            }
            if (result.status !== 0 || hasInvalidSvgGeometry(`${result.stdout ?? ''}\n${result.stderr ?? ''}`)) {
                await Promise.all([
                    rm(image, { force: true }),
                    rm(validationMarker, { force: true })
                ]);
                if (result.status === 0) {
                    console.error(`Mermaid produjo geometría inválida al renderizar ${source}.`);
                }
                return null;
            }
            if (!existsSync(image)) {
                console.error(`Mermaid no generó la imagen esperada para ${source}.`);
                return null;
            }
            await writeFile(validationMarker, `${id}\n`);
        }
        renderedContent = renderedContent.replace(match[0], `![${diagramCaption(content, match.index)}](${image})`);
    }
    renderedContent = await addFigureAnchors(renderedContent, source, firstFigureNumber);
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
        const relativeDocxOutput = directory ? path.join(directory, `${document}.docx`) : `${document}.docx`;
        const relativePdfOutput = directory ? path.join(directory, `${document}.pdf`) : `${document}.pdf`;
        const docxOutput = path.join(documentOutputDirectories.docx, relativeDocxOutput);
        const pdfOutput = path.join(documentOutputDirectories.pdf, relativePdfOutput);
        await Promise.all([
            mkdir(path.dirname(docxOutput), { recursive: true }),
            mkdir(path.dirname(pdfOutput), { recursive: true })
        ]);
        await Promise.all([
            ...(outputPlan.generateDocx ? [removeDocumentOutput(docxOutput)] : []),
            ...(outputPlan.generatePdf ? [removeDocumentOutput(pdfOutput)] : [])
        ]);
        const preparedSources = [];
        const publicationSources = new Set(sources);
        let nextFigureNumber = 1;
        for (const source of outputPlan.generateDocx ? sources : []) {
            const prepared = await prepareSource(
                source,
                publicationSources,
                nextFigureNumber,
                relativeDocxOutput,
                'docx'
            );
            if (!prepared) {
                failedStatus = 1;
                break;
            }
            preparedSources.push(prepared.renderedSource);
            nextFigureNumber = prepared.nextFigureNumber;
        }
        if (failedStatus) break;

        if (outputPlan.generateDocx) {
            const firstSource = preparedSources[0];
            const firstContent = await readFile(firstSource, 'utf8');
            const indexes = await buildDocumentIndexes(preparedSources);
            await writeFile(firstSource, insertAfterDocumentData(firstContent, indexes));

            const scopedSources = preparedSources.map((source) => path.relative(temporaryDirectory, source));
            const args = [
                ...scopedSources,
                '--from=markdown+header_attributes+implicit_figures',
                `--lua-filter=${path.join(ROOT, 'scripts/documentExportLineBreaks.lua')}`,
                '--standalone',
                '--metadata=lang:es-MX',
                `--output=${docxOutput}`,
                `--resource-path=${[ROOT, path.join(ROOT, 'docs')].join(path.delimiter)}`
            ];
            if (process.env.DOCS_REFERENCE_DOC) args.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
            const result = spawnSync('pandoc', args, { cwd: temporaryDirectory, stdio: 'inherit' });
            if (result.error || result.status !== 0 || !existsSync(docxOutput)) {
                failedStatus = result.status ?? 1;
                break;
            }
            console.log(`Documento DOCX generado en ${path.relative(ROOT, docxOutput)}.`);
        }
        if (outputPlan.generatePdf) {
            let conversionInput = docxOutput;
            const pdfPreparedSources = [];
            let pdfFigureNumber = 1;
            for (const source of sources) {
                const prepared = await prepareSource(
                    source,
                    publicationSources,
                    pdfFigureNumber,
                    relativePdfOutput,
                    'pdf'
                );
                if (!prepared) {
                    failedStatus = 1;
                    break;
                }
                pdfPreparedSources.push(prepared.renderedSource);
                pdfFigureNumber = prepared.nextFigureNumber;
            }
            if (failedStatus) break;
            const pdfFirstSource = pdfPreparedSources[0];
            const pdfFirstContent = await readFile(pdfFirstSource, 'utf8');
            await writeFile(pdfFirstSource, insertAfterDocumentData(
                pdfFirstContent,
                await buildDocumentIndexes(pdfPreparedSources)
            ));
            conversionInput = path.join(temporaryDirectory, 'pdf-input', relativeDocxOutput);
            await mkdir(path.dirname(conversionInput), { recursive: true });
            const pdfDocxArguments = [
                ...pdfPreparedSources.map(source => path.relative(temporaryDirectory, source)),
                '--from=markdown+header_attributes+implicit_figures',
                `--lua-filter=${path.join(ROOT, 'scripts/documentExportLineBreaks.lua')}`,
                '--standalone',
                '--metadata=lang:es-MX',
                `--output=${conversionInput}`,
                `--resource-path=${[ROOT, path.join(ROOT, 'docs')].join(path.delimiter)}`
            ];
            if (process.env.DOCS_REFERENCE_DOC) {
                pdfDocxArguments.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
            }
            const pdfDocxResult = spawnSync('pandoc', pdfDocxArguments, {
                cwd: temporaryDirectory,
                stdio: 'inherit'
            });
            if (pdfDocxResult.error || pdfDocxResult.status !== 0 || !existsSync(conversionInput)) {
                failedStatus = pdfDocxResult.status ?? 1;
                break;
            }
            const conversion = spawnSync(pdfConverter, [
                `-env:UserInstallation=${pathToFileURL(path.join(temporaryDirectory, 'libreoffice-profile')).href}`,
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                path.dirname(pdfOutput),
                conversionInput
            ], {
                cwd: ROOT,
                env: preparePdfConverterEnvironment(),
                stdio: 'inherit',
                windowsHide: true
            });
            if (conversion.error || conversion.status !== 0 || !existsSync(pdfOutput)) {
                console.error(`No se pudo convertir ${path.relative(ROOT, docxOutput)} a PDF con ${pdfConverter}.`);
                failedStatus = conversion.status ?? 1;
                break;
            }
            try {
                await validatePdfOutput(pdfOutput);
            } catch (error) {
                await rm(pdfOutput, { force: true });
                console.error(error.message);
                failedStatus = 1;
                break;
            }
            console.log(`Documento PDF generado en ${path.relative(ROOT, pdfOutput)}.`);
        }
        if (publication === 'arquitectura'
            && (!requestedDocument || requestedDocument === 'contrato-api')) {
            const openApiOutput = path.join(openApiOutputDirectory, 'openapi.json');
            const openApiContract = await bundleOpenApiContract(path.join(ROOT, OPENAPI_SOURCE));
            await writeFile(openApiOutput, `${JSON.stringify(openApiContract, null, 2)}\n`);
            console.log(`Contrato OpenAPI exportado en ${path.relative(ROOT, openApiOutput)}.`);
        }
    }
} catch (error) {
    console.error(error.message);
    failedStatus = 1;
} finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
}
if (failedStatus) process.exit(failedStatus);
