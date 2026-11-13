import { validProfileId } from './profiles.mjs';
import { parseManualMode } from './environment.mjs';

export const MANUAL_HELP = `Capturas y manuales por cuenta: sólo desarrollo local

Desde la raíz del repositorio:
  npm --prefix front run docs:screenshots -- --all
  npm --prefix front run docs:manuals -- --all --format ambos
  npm --prefix front run docs:manuals -- --profile cuenta-01 --format pdf
Desde front/, omita --prefix front.

Ejecute primero docs:screenshots y después docs:manuals.
El modo predeterminado es dev. Ambos seleccionan cuentas de manual.accounts.local.json.
NODE_ENV no puede ser production.

docs:screenshots inicia sesión con .env.manual.local y obtiene permisos y capturas.
La dirección de Vue debe ser local; en HTTP inicia Vite si hace falta.
La API debe estar activa. Las cuentas sin credenciales completas se informan y omiten.
Repetir el comando completa las capturas faltantes; nunca exporta Word/PDF.
Las capturas y fuentes quedan en docs/user-manual/accounts/<cuenta>/.

docs:manuals exporta las fuentes y capturas ya verificadas; no abre el navegador,
no inicia servicios ni lee credenciales. No genera imágenes faltantes.
Con --all informa las cuentas sin capturas; una captura pendiente o inválida bloquea
la exportación. Se genera un archivo por módulo con su glosario. Word/PDF quedan en
build/docs/{docx,pdf}/manuales-vue/<cuenta>/<modulo>.*.

Opciones comunes:
  --all                     Todas las cuentas configuradas.
  --profile <id>            Una cuenta del JSON.
  --accounts <archivo>      Configuración de cuentas; rutas relativas a front/.
  --mode dev|demo           Capturas reales o ficticias; predeterminado: dev.
  --help                    Mostrar esta ayuda.

Sólo docs:screenshots:
  --missing                 Reanudar faltantes (ya es el comportamiento predeterminado).
  --fresh                   Rehacer las capturas de las cuentas seleccionadas.
  --env-file <archivo>      Credenciales locales; rutas relativas a front/.

Sólo docs:manuals:
  --format docx|pdf|ambos    Formato de publicación; predeterminado: ambos.

Preparación: docs/governance/07-manual-accounts-and-files.md
`;

export const parseManualOptions = (args) => {
    const [command, ...options] =
        args.length === 1 && args[0] === '--help' ? ['export', '--help'] : args;
    if (!['capture', 'export'].includes(command))
        throw new Error('Seleccione capture o export. Use docs:screenshots o docs:manuals.');
    const values = {
        command,
        mode: 'dev',
        accounts: 'manual.accounts.local.json',
        profile: '',
        all: false,
        help: false,
        ...(command === 'capture'
            ? { 'env-file': '.env.manual.local', missing: true, fresh: false }
            : { format: 'ambos' }),
    };
    for (let i = 0; i < options.length; i++) {
        const key = options[i].replace(/^--/, '');
        if (!options[i].startsWith('--') || key === 'command' || !Object.hasOwn(values, key))
            throw new Error('Opción de manual desconocida. Consulte --help.');
        if (typeof values[key] === 'boolean') values[key] = true;
        else {
            if (!options[i + 1] || options[i + 1].startsWith('--'))
                throw new Error(`Falta el valor de --${key}.`);
            values[key] = options[++i];
        }
    }
    if (values.help) return values;
    if (values.fresh && options.includes('--missing'))
        throw new Error('Use --fresh o --missing, sin combinarlos.');
    if (values.fresh) values.missing = false;
    parseManualMode(values.mode);
    if (command === 'export' && !['ambos', 'pdf', 'docx'].includes(values.format))
        throw new Error('Use --format docx, --format pdf o --format ambos.');
    if (Boolean(values.profile) === values.all)
        throw new Error('Seleccione --profile <id> o --all. Consulte --help.');
    if (values.profile && !validProfileId(values.profile))
        throw new Error('El identificador de cuenta no es válido.');
    return values;
};
