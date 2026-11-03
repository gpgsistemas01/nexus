import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO_PROFILES, readAccounts, selectAccountsWithCredentials } from './manual/profiles.mjs';
import { MANUAL_HELP, parseManualOptions } from './manual/options.mjs';
import { loadManualPublication } from './manual/publication.mjs';

const frontRoot = fileURLToPath(new URL('../', import.meta.url));
const runManuals = async () => {
    const values = parseManualOptions(process.argv.slice(2));
    if (values.help) {
        console.log(MANUAL_HELP);
        return;
    }
    const configuration =
        values.mode === 'demo'
            ? { baseUrl: 'http://127.0.0.1:5177', accounts: DEMO_PROFILES }
            : await readAccounts(path.resolve(frontRoot, values.accounts));
    const accounts = configuration.accounts;
    const requested = accounts.filter((profile) => values.all || profile.id === values.profile);
    if (!requested.length) throw new Error('La cuenta solicitada no está configurada.');
    const envFile = path.resolve(frontRoot, values['env-file']);
    const selection =
        values.mode === 'live'
            ? await selectAccountsWithCredentials(requested, envFile)
            : { accounts: requested, omitted: [] };
    for (const id of selection.omitted)
        console.log(`Cuenta omitida: ${id} (falta usuario o contraseña).`);
    const selected = selection.accounts;
    if (!selected.length) {
        console.log(
            'No hay cuentas con credenciales completas. No se generaron capturas ni manuales en esta ejecución.',
        );
        return;
    }
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
                FRONT_MANUAL_ENV_FILE: envFile,
                FRONT_MANUAL_MISSING: String(values.missing),
            },
        },
    );
    if (result.error || result.status !== 0)
        throw new Error(
            'La captura por cuenta no terminó. Revise el estado de cada manual; no se publicaron resultados incompletos.',
        );
    for (const profile of selected) {
        await loadManualPublication(frontRoot, profile.id);
        console.log(`Capturas de ${profile.id}: build/manuals/${profile.id}/images/`);
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
};

try {
    await runManuals();
} catch (error) {
    console.error(error instanceof Error ? error.message : 'No se pudo generar el manual.');
    process.exitCode = 1;
}
