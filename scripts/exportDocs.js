import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { justifyDocxParagraphs } from './justifyDocxParagraphs.js';

const ROOT = process.cwd();
const manualCases = [
    'docs/user-manual/cases/authentication.md',
    'docs/user-manual/cases/identity-access.md',
    'docs/user-manual/cases/catalogs.md',
    'docs/user-manual/cases/purchases.md',
    'docs/user-manual/cases/issues.md',
    'docs/user-manual/cases/reports.md'
];
const [authenticationCases, identityCases, catalogCases, purchaseCases, issueCases, reportCases] = manualCases;
const manualCommon = [
    'docs/user-manual/index.md',
    'docs/user-manual/procedures.md'
];
const manualErrorCatalog = 'docs/user-manual/error-messages.md';
const manualReferences = [
    manualErrorCatalog,
    'docs/user-manual/screenshot-inventory.md'
];
const sequenceGroups = [
    'authentication',
    'identity-access',
    'catalogs',
    'purchases',
    'issues',
    'reports'
];
const sequenceDocuments = (side) => [
    `docs/architecture/${side}-code-sequences/index.md`,
    ...sequenceGroups.map((group) => `docs/architecture/${side}-code-sequences/${group}.md`)
];
const MANIFESTS = Object.freeze({
    'manual-usuario': [...manualCommon, ...manualCases, ...manualReferences],
    'manual-administrador': [
        'docs/user-manual/actors/administrator.md',
        authenticationCases,
        identityCases,
        catalogCases,
        reportCases,
        manualErrorCatalog
    ],
    'manual-almacen': [
        'docs/user-manual/actors/warehouse.md',
        authenticationCases,
        catalogCases,
        purchaseCases,
        issueCases,
        reportCases,
        manualErrorCatalog
    ],
    'manual-reportes': [
        'docs/user-manual/actors/reporting.md',
        authenticationCases,
        catalogCases,
        purchaseCases,
        issueCases,
        reportCases,
        manualErrorCatalog
    ],
    requisitos: [
        'docs/requirements/index.md',
        'docs/requirements/vision-scope-and-requirements.md',
        'docs/requirements/requirements-specification.md',
        'docs/requirements/domain-and-use-cases.md',
        'docs/requirements/use-case-descriptions.md',
        'docs/requirements/requirements-diagrams.md',
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
        'docs/architecture/architecture-and-web-views.md',
        'docs/architecture/web-navigation-and-screen-catalog.md',
        'docs/architecture/technical-code-documentation.md',
        'docs/architecture/backend-technical-documentation.md',
        'docs/architecture/api-contract.md',
        ...sequenceDocuments('backend'),
        'docs/architecture/frontend-technical-documentation.md',
        ...sequenceDocuments('frontend'),
        'docs/architecture/traceability-matrix.md',
        'docs/architecture/design-and-construction-patterns.md',
        'docs/architecture/code-diagrams.md',
        'docs/generated/code-map.md',
        'docs/architecture/diagram-conventions.md',
        'docs/architecture/diagram-inventory.md',
        'docs/architecture/decisions/index.md',
        'docs/architecture/decisions/ADR-001-secuencias-por-perspectiva-y-grupo.md'
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
const formats = new Set(['docx', 'pdf']);
const pdfConverter = process.env.DOCS_PDF_CONVERTER || 'soffice';
const publicationNames = Object.keys(MANIFESTS);
const mermaidBlock = /^```mermaid\r?\n([\s\S]*?)^```\r?$/gm;
const externalLink = /^(?:https?:|mailto:)/;
const markdownLink = /(?<!!)\[([^\]]+)\]\(([^) ]+)([^)]*)\)/g;
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

const insertAfterFrontMatter = (content, insertion) => {
    const frontMatter = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (!frontMatter) return `${insertion}\n${content}`;
    return `${frontMatter[0]}${insertion}\n${content.slice(frontMatter[0].length)}`;
};

if ((requestedPublication !== 'todos' && !MANIFESTS[requestedPublication])
    || (checkOnly ? requestedFormat && !formats.has(requestedFormat) : !formats.has(requestedFormat))) {
    console.error('Uso: npm run docs:export -- <todos|manual-usuario|manual-administrador|manual-almacen|manual-reportes|requisitos|datos|arquitectura|pruebas> [docx|pdf] [--check]');
    process.exit(1);
}

const requestedPublications = requestedPublication === 'todos' ? publicationNames : [requestedPublication];
const publications = await Promise.all(requestedPublications.map(async (publication) => {
    const sources = MANIFESTS[publication];
    await Promise.all(sources.map((source) => access(path.join(ROOT, source))));
    const sourceContents = await Promise.all(sources.map(async (source) => ({
        source,
        content: await readFile(path.join(ROOT, source), 'utf8')
    })));
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
    return { publication, sources, imageReferences };
}));

if (checkOnly) {
    for (const { publication, sources, imageReferences } of publications) {
        console.log(`Paquete ${publication}: ${sources.length} fuentes y ${imageReferences.length} imágenes válidas.`);
    }
    process.exit(0);
}

const pandoc = spawnSync('pandoc', ['--version'], { encoding: 'utf8' });
if (pandoc.error || pandoc.status !== 0) {
    console.error('Pandoc no está disponible. Instálalo o usa --check para validar las fuentes.');
    process.exit(1);
}
if (requestedFormat === 'pdf') {
    const pdfConverterCheck = spawnSync(pdfConverter, ['--version'], { encoding: 'utf8' });
    if (pdfConverterCheck.error || pdfConverterCheck.status !== 0) {
        console.error(`El conversor DOCX a PDF (${pdfConverter}) no está disponible en PATH. Instala LibreOffice, vuelve a abrir la terminal y comprueba: ${pdfConverter} --version`);
        process.exit(1);
    }
}

const outputDirectory = path.join(ROOT, 'build/docs');
await mkdir(outputDirectory, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(outputDirectory, '.export-'));
const diagramOutputDirectory = path.join(outputDirectory, 'diagrams');
const diagramSourceDirectory = path.join(outputDirectory, 'diagram-sources');
await Promise.all([
    mkdir(diagramOutputDirectory, { recursive: true }),
    mkdir(diagramSourceDirectory, { recursive: true })
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
            if (!existsSync(mermaidExecutable)) {
                console.error('Mermaid CLI no está disponible. Ejecuta npm install --no-save @mermaid-js/mermaid-cli antes de exportar documentos con diagramas.');
                return null;
            }
            const result = spawnSync(process.execPath, [mermaidExecutable, '--input', input, '--output', image, '--backgroundColor', 'white', '--scale', '2'], { cwd: ROOT, stdio: 'inherit' });
            if (result.error?.code === 'ENOENT') {
                await rm(image, { force: true });
                console.error('Mermaid CLI no está disponible. Ejecuta npm install --no-save @mermaid-js/mermaid-cli antes de exportar documentos con diagramas.');
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
    for (const { publication, sources } of publications) {
        const output = path.join(outputDirectory, `${publication}.${requestedFormat}`);
        const docxOutput = path.join(outputDirectory, `${publication}.docx`);
        await rm(output, { force: true });
        if (requestedFormat === 'pdf') await rm(docxOutput, { force: true });
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
        await writeFile(firstSource, insertAfterFrontMatter(firstContent, indexes));

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
        await justifyDocxParagraphs(docxOutput, temporaryDirectory);
        if (requestedFormat === 'pdf') {
            console.log(`Documento intermedio generado en ${path.relative(ROOT, docxOutput)}.`);
            const conversion = spawnSync(pdfConverter, [
                `-env:UserInstallation=${pathToFileURL(path.join(temporaryDirectory, 'libreoffice-profile')).href}`,
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                outputDirectory,
                docxOutput
            ], { cwd: ROOT, stdio: 'inherit' });
            if (conversion.status !== 0 || !existsSync(output)) {
                console.error(`No se pudo convertir ${path.relative(ROOT, docxOutput)} a PDF con ${pdfConverter}.`);
                failedStatus = conversion.status ?? 1;
                break;
            }
        }
        console.log(`Documento generado en ${path.relative(ROOT, output)}.`);
    }
} finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
}
if (failedStatus) process.exit(failedStatus);
