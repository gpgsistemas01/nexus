import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { generateCodeReference } from './documentation.mjs';
import { generateTypeReference } from './typeDocumentation.mjs';
import { loadDocumentationCatalog, parseDocumentationExportArgs } from './documentationCatalog.mjs';

const frontRoot = fileURLToPath(new URL('../', import.meta.url));
const [command, ...args] = process.argv.slice(2);

const runExport = (exportArgs, section = null) => {
    const result = spawnSync(
        process.execPath,
        [
            'scripts/exportDocs.js',
            section === 'manual' ? 'manual-vue' : 'arquitectura',
            section === 'manual'
                ? 'manual-usuario'
                : section
                  ? `frontend-vue-${section}`
                  : 'frontend-vue',
            ...exportArgs,
        ],
        {
            cwd: path.resolve(frontRoot, '../back'),
            stdio: 'inherit',
        },
    );
    if (result.error) throw result.error;
    if (result.status !== 0)
        throw new Error(
            `La publicación documental terminó con estado ${result.status ?? result.signal}.`,
        );
};

try {
    if (command === 'generate' && !args.length) {
        await generateCodeReference(frontRoot, false);
        await generateTypeReference(frontRoot, false);
        console.log(
            'Referencias Vue y contratos TypeScript generados en front/docs/architecture/views/.',
        );
    } else if (command === 'check' && !args.length) {
        await generateCodeReference(frontRoot, true);
        await generateTypeReference(frontRoot, true);
        runExport(['--check']);
        runExport(['--check'], 'manual');
        runExport(['--check'], 'tipos');
    } else if (command === 'export') {
        const catalog = await loadDocumentationCatalog(path.join(frontRoot, 'docs'));
        const { section, format } = parseDocumentationExportArgs(
            args,
            Object.keys(catalog.sections),
        );
        await generateCodeReference(frontRoot, true);
        await generateTypeReference(frontRoot, true);
        runExport([format], section);
    } else
        throw new Error(
            'Usa npm run docs:generate, npm run docs:check o npm run docs:export -- [seccion] [docx|pdf|ambos].',
        );
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
