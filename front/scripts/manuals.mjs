import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO_PROFILES, readAccounts, validProfileId } from './manual/profiles.mjs';
import { loadManualPublication } from './manual/publication.mjs';

const frontRoot = fileURLToPath(new URL('../', import.meta.url));
const values = {
    mode: 'demo',
    format: 'ambos',
    accounts: 'manual.accounts.local.json',
    'env-file': '.env.manual.local',
    profile: '',
    all: false,
    missing: false,
    'capture-only': false,
};
try {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        const key = args[i].replace(/^--/, '');
        if (!args[i].startsWith('--') || !Object.hasOwn(values, key))
            throw new Error('Opción de manual desconocida.');
        if (typeof values[key] === 'boolean') values[key] = true;
        else {
            if (!args[i + 1] || args[i + 1].startsWith('--'))
                throw new Error(`Falta el valor de --${key}.`);
            values[key] = args[++i];
        }
    }
    if (
        !['demo', 'live'].includes(values.mode) ||
        !['ambos', 'pdf', 'docx'].includes(values.format) ||
        (values.profile && !validProfileId(values.profile)) ||
        Boolean(values.profile) === values.all
    )
        throw new Error(
            'Use --mode demo|live y --profile <id> o --all, con --format docx|pdf|ambos.',
        );
    const configuration =
        values.mode === 'demo'
            ? { baseUrl: 'http://127.0.0.1:5177', accounts: DEMO_PROFILES }
            : await readAccounts(path.resolve(frontRoot, values.accounts));
    const accounts = configuration.accounts;
    const selected = accounts.filter((profile) => values.all || profile.id === values.profile);
    if (!selected.length) throw new Error('El perfil solicitado no está configurado.');
    const result = spawnSync(
        process.execPath,
        [
            'node_modules/@playwright/test/cli.js',
            'test',
            '--config',
            'playwright.manualProfiles.config.ts',
        ],
        {
            cwd: frontRoot,
            stdio: 'inherit',
            env: {
                ...process.env,
                FRONT_MANUAL_MODE: values.mode,
                FRONT_MANUAL_BASE_URL: configuration.baseUrl,
                FRONT_MANUAL_IDS: selected.map(({ id }) => id).join(','),
                FRONT_MANUAL_ACCOUNTS: path.resolve(frontRoot, values.accounts),
                FRONT_MANUAL_ENV_FILE: path.resolve(frontRoot, values['env-file']),
                FRONT_MANUAL_MISSING: String(values.missing),
            },
        },
    );
    if (result.error || result.status !== 0)
        throw new Error(
            'La captura de perfiles no terminó. Revise el estado de cada manual; no se publicaron resultados incompletos.',
        );
    for (const profile of selected) {
        await loadManualPublication(frontRoot, profile.id);
        if (values['capture-only']) continue;
        const output = spawnSync(
            process.execPath,
            ['scripts/exportDocs.js', 'manual-vue', `manual-${profile.id}`, values.format],
            {
                cwd: path.resolve(frontRoot, '../back'),
                stdio: 'inherit',
                env: { ...process.env, DOCS_FRONT_MANUAL_PROFILE: profile.id },
            },
        );
        if (output.error || output.status !== 0)
            throw new Error(`No se pudo exportar ${profile.id}.`);
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : 'No se pudo generar el manual.');
    process.exitCode = 1;
}
