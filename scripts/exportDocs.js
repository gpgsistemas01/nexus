import { access, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const MANIFESTS = Object.freeze({
    'manual-usuario': ['docs/user-manual/index.md'],
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
        'docs/architecture/design-and-construction-patterns.md',
        'docs/architecture/code-diagrams.md'
    ],
    pruebas: ['docs/testing/test-plan.md', 'docs/testing/service-test-coverage.md']
});
const [publication, requestedFormat = 'html'] = process.argv.slice(2).filter((argument) => argument !== '--check');
const checkOnly = process.argv.includes('--check');
const formats = new Set(['html', 'docx', 'pdf']);

if (!MANIFESTS[publication] || !formats.has(requestedFormat)) {
    console.error('Uso: npm run docs:export -- <manual-usuario|requisitos|arquitectura|pruebas> <html|docx|pdf> [--check]');
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
const args = [...sources, '--from=gfm', '--standalone', '--toc', `--output=${output}`, '--resource-path=.:docs'];
if (requestedFormat === 'html') args.push('--css=../../docs/styles/document.css');
if (requestedFormat === 'docx' && process.env.DOCS_REFERENCE_DOC) args.push(`--reference-doc=${process.env.DOCS_REFERENCE_DOC}`);
if (requestedFormat === 'pdf' && process.env.DOCS_PDF_ENGINE) args.push(`--pdf-engine=${process.env.DOCS_PDF_ENGINE}`);
const result = spawnSync('pandoc', args, { cwd: ROOT, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Documento generado en ${path.relative(ROOT, output)}.`);
