import { access, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
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
        'docs/architecture/architecture-and-web-views.md',
        'docs/architecture/technical-code-documentation.md',
        'docs/architecture/backend-technical-documentation.md',
        'docs/architecture/frontend-technical-documentation.md',
        'docs/architecture/traceability-matrix.md',
        'docs/architecture/design-and-construction-patterns.md',
        'docs/architecture/code-diagrams.md',
        'docs/architecture/diagram-conventions.md',
        'docs/architecture/diagram-inventory.md'
    ],
    pruebas: [
        'docs/testing/test-plan.md',
        'docs/testing/service-test-coverage.md',
        'docs/testing/unit-test-catalog.md',
        'docs/testing/unit-test-results.md'
    ]
});
const [publication, requestedFormat = 'html'] = process.argv.slice(2).filter((argument) => argument !== '--check');
const checkOnly = process.argv.includes('--check');
const formats = new Set(['html', 'docx', 'pdf']);

if (!MANIFESTS[publication] || !formats.has(requestedFormat)) {
    console.error('Uso: npm run docs:export -- <manual-usuario|manual-administrador|manual-almacen|manual-reportes|requisitos|arquitectura|pruebas> <html|docx|pdf> [--check]');
    process.exit(1);
}

const sources = MANIFESTS[publication];
await Promise.all(sources.map((source) => access(path.join(ROOT, source))));
const sourceContents = await Promise.all(sources.map(async (source) => ({
    source,
    content: await readFile(path.join(ROOT, source), 'utf8')
})));
const imageReferences = sourceContents.flatMap(({ source, content }) => (
    [...content.matchAll(/!\[[^\]]*\]\(([^) ]+)/g)].map((match) => ({ source, image: match[1] }))
));
await Promise.all(imageReferences.map(({ source, image }) => (
    access(path.resolve(ROOT, path.dirname(source), image))
)));

if (checkOnly) {
    console.log(`Paquete ${publication}: ${sources.length} fuentes y ${imageReferences.length} imágenes válidas.`);
    process.exit(0);
}

const pandoc = spawnSync('pandoc', ['--version'], { encoding: 'utf8' });
if (pandoc.error || pandoc.status !== 0) {
    console.error('Pandoc no está disponible. Instálalo o usa --check para validar las fuentes.');
    process.exit(1);
}

const outputDirectory = path.join(ROOT, 'build/docs');
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, `${publication}.${requestedFormat}`);
const args = [...sources, '--from=gfm', '--file-scope', '--standalone', '--toc', `--output=${output}`, '--resource-path=.:docs'];
if (requestedFormat === 'html') args.push('--css=../../docs/styles/document.css');
if (requestedFormat === 'docx' && process.env.DOCS_REFERENCE_DOC) args.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
if (requestedFormat === 'pdf' && process.env.DOCS_PDF_ENGINE) args.push(`--pdf-engine=${process.env.DOCS_PDF_ENGINE}`);
const result = spawnSync('pandoc', args, { cwd: ROOT, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Documento generado en ${path.relative(ROOT, output)}.`);
