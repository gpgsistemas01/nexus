import { validProfileId } from './profiles.mjs';
import { parseManualMode } from './environment.mjs';

export const MANUAL_HELP = `Capturas y manuales por cuenta: sólo desarrollo local

Desde front/:
  npm run docs:screenshots -- --all
  npm run docs:manuals -- --all --format ambos
  npm run docs:manuals -- --profile cuenta-01 --missing

El modo predeterminado es dev. Lee manual.accounts.local.json y .env.manual.local.
La dirección de Vue debe ser local y NODE_ENV no puede ser production.
Cada cuenta inicia sesión para detectar sus áreas, roles y permisos.
Las cuentas sin usuario o contraseña se omiten, sin detener las demás.
Las capturas quedan en build/manuals/<cuenta>/images/.
Word y PDF quedan en build/docs/{docx,pdf}/manuales-vue/<cuenta>/.

Opciones:
  --all                     Cuentas del JSON con credenciales completas.
  --profile <id>            Una cuenta del JSON.
  --capture-only            Sólo fuentes y capturas, sin exportar Word/PDF.
  --missing                 Reanudar capturas pendientes o desactualizadas.
  --format docx|pdf|ambos    Formato de publicación; predeterminado: ambos.
  --accounts <archivo>      Configuración de cuentas; rutas relativas a front/.
  --env-file <archivo>      Credenciales locales; rutas relativas a front/.
  --mode dev|demo           Cuentas locales o datos ficticios; predeterminado: dev.
  --help                    Mostrar esta ayuda.

Preparación: docs/governance/07-manual-accounts-and-files.md
`;

export const parseManualOptions = (args) => {
    const values = {
        mode: 'dev',
        format: 'ambos',
        accounts: 'manual.accounts.local.json',
        'env-file': '.env.manual.local',
        profile: '',
        all: false,
        missing: false,
        'capture-only': false,
        help: false,
    };
    for (let i = 0; i < args.length; i++) {
        const key = args[i].replace(/^--/, '');
        if (!args[i].startsWith('--') || !Object.hasOwn(values, key))
            throw new Error('Opción de manual desconocida. Consulte --help.');
        if (typeof values[key] === 'boolean') values[key] = true;
        else {
            if (!args[i + 1] || args[i + 1].startsWith('--'))
                throw new Error(`Falta el valor de --${key}.`);
            values[key] = args[++i];
        }
    }
    if (values.help) return values;
    parseManualMode(values.mode);
    if (!['ambos', 'pdf', 'docx'].includes(values.format))
        throw new Error('Use --format docx, --format pdf o --format ambos.');
    if (Boolean(values.profile) === values.all)
        throw new Error('Seleccione --profile <id> o --all. Consulte --help.');
    if (values.profile && !validProfileId(values.profile))
        throw new Error('El identificador de cuenta no es válido.');
    return values;
};
