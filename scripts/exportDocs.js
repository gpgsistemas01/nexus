import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

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
    arquitectura: [
        'docs/architecture/index.md',
        'docs/architecture/architecture-and-web-views.md',
        'docs/architecture/web-navigation-and-screen-catalog.md',
        'docs/architecture/technical-code-documentation.md',
        'docs/architecture/backend-technical-documentation.md',
        ...sequenceDocuments('backend'),
        'docs/architecture/frontend-technical-documentation.md',
        ...sequenceDocuments('frontend'),
        'docs/architecture/traceability-matrix.md',
        'docs/architecture/design-and-construction-patterns.md',
        'docs/architecture/code-diagrams.md',
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
const publicationNames = Object.keys(MANIFESTS);
const mermaidBlock = /^```mermaid\n([\s\S]*?)^```$/gm;
const externalLink = /^(?:https?:|mailto:)/;
const diagramCaption = (content, index) => {
    const headings = [...content.slice(0, index).matchAll(/^#{1,6}\s+(.+)$/gm)];
    const heading = headings.at(-1)?.[1].replace(/[`[*_\]]/g, '').trim();
    if (!heading) throw new Error('Cada bloque Mermaid debe estar declarado bajo un encabezado Markdown.');
    return `Diagrama — ${heading}`;
};

if ((requestedPublication !== 'todos' && !MANIFESTS[requestedPublication])
    || (checkOnly ? requestedFormat && !formats.has(requestedFormat) : !formats.has(requestedFormat))) {
    console.error('Uso: npm run docs:export -- <todos|manual-usuario|manual-administrador|manual-almacen|manual-reportes|requisitos|arquitectura|pruebas> [docx|pdf] [--check]');
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

const outputDirectory = path.join(ROOT, 'build/docs');
await mkdir(outputDirectory, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(outputDirectory, '.export-'));
const diagramOutputDirectory = path.join(outputDirectory, 'diagrams');
const diagramSourceDirectory = path.join(outputDirectory, 'diagram-sources');
await Promise.all([
    rm(diagramOutputDirectory, { recursive: true, force: true }),
    rm(diagramSourceDirectory, { recursive: true, force: true })
]);
await Promise.all([
    mkdir(diagramOutputDirectory, { recursive: true }),
    mkdir(diagramSourceDirectory, { recursive: true })
]);
const renderedDiagrams = new Map();
const mermaidExecutable = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc');

const prepareSource = async (source) => {
    const content = await readFile(path.join(ROOT, source), 'utf8');
    const blocks = [...content.matchAll(mermaidBlock)];

    const renderedSource = path.join(temporaryDirectory, source);
    await mkdir(path.dirname(renderedSource), { recursive: true });
    let renderedContent = content.replace(/(!\[[^\]]*\]\()([^) ]+)/g, (reference, prefix, image) => (
        `${prefix}${path.resolve(ROOT, path.dirname(source), image)}`
    ));
    for (const match of blocks) {
        const diagram = match[1];
        const id = createHash('sha256').update(diagram).digest('hex').slice(0, 16);
        let image = renderedDiagrams.get(id);
        if (!image) {
            const input = path.join(diagramSourceDirectory, `${id}.mmd`);
            image = path.join(diagramOutputDirectory, `${id}.png`);
            await writeFile(input, diagram);
            const result = spawnSync(mermaidExecutable, ['--input', input, '--output', image, '--backgroundColor', 'white', '--scale', '2'], { cwd: ROOT, stdio: 'inherit' });
            if (result.error?.code === 'ENOENT') {
                console.error('Mermaid CLI no está disponible. Ejecuta npm install --no-save @mermaid-js/mermaid-cli antes de exportar documentos con diagramas.');
                return null;
            }
            if (result.status !== 0) return null;
            renderedDiagrams.set(id, image);
        }
        renderedContent = renderedContent.replace(match[0], `![${diagramCaption(content, match.index)}](${image})`);
    }
    await writeFile(renderedSource, renderedContent);
    return renderedSource;
};

let failedStatus = 0;
try {
    for (const { publication, sources } of publications) {
        const preparedSources = [];
        for (const source of sources) {
            const preparedSource = await prepareSource(source);
            if (!preparedSource) {
                failedStatus = 1;
                break;
            }
            preparedSources.push(preparedSource);
        }
        if (failedStatus) break;

        const output = path.join(outputDirectory, `${publication}.${requestedFormat}`);
        const args = [...preparedSources, '--from=gfm+implicit_figures', '--file-scope', '--standalone', '--toc', `--output=${output}`, '--resource-path=.:docs'];
        if (requestedFormat === 'docx' && process.env.DOCS_REFERENCE_DOC) args.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
        if (requestedFormat === 'pdf' && process.env.DOCS_PDF_ENGINE) args.push(`--pdf-engine=${process.env.DOCS_PDF_ENGINE}`);
        const result = spawnSync('pandoc', args, { cwd: ROOT, stdio: 'inherit' });
        if (result.status !== 0) {
            failedStatus = result.status ?? 1;
            break;
        }
        console.log(`Documento generado en ${path.relative(ROOT, output)}.`);
    }
} finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
}
if (failedStatus) process.exit(failedStatus);
