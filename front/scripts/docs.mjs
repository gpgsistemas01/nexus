import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { generateCodeReference } from './documentation.mjs';

const frontRoot = fileURLToPath(new URL('../', import.meta.url));
const [command, ...args] = process.argv.slice(2);

const runExport = (exportArgs) => {
    const result = spawnSync(
        process.execPath,
        ['scripts/exportDocs.js', 'arquitectura', 'frontend-vue', ...exportArgs],
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
        console.log('Referencia Vue generada en front/docs/architecture/05-code-reference.md.');
    } else if (command === 'check' && !args.length) {
        await generateCodeReference(frontRoot, true);
        runExport(['--check']);
    } else if (
        command === 'export' &&
        args.length <= 1 &&
        (!args[0] || ['docx', 'pdf', 'ambos'].includes(args[0]))
    ) {
        await generateCodeReference(frontRoot, true);
        runExport([args[0] ?? 'ambos']);
    } else
        throw new Error(
            'Usa npm run docs:generate, npm run docs:check o npm run docs:export -- [docx|pdf|ambos].',
        );
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
