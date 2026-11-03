import { expect, it } from 'vitest';
import { parseManualOptions } from '../../../scripts/manual/options.mjs';
import { assertManualDevelopment } from '../../../scripts/manual/environment.mjs';

it('usa cuentas y credenciales locales por defecto, sin seleccionar demostraciones', () => {
  expect(parseManualOptions(['--all'])).toMatchObject({
    mode: 'dev',
    accounts: 'manual.accounts.local.json',
    'env-file': '.env.manual.local',
    all: true,
    format: 'ambos',
    'capture-only': false,
  });
});

it('permite capturar una cuenta y reanudar usando sus archivos seleccionados', () => {
  expect(
    parseManualOptions([
      '--capture-only',
      '--profile',
      'cuenta-01',
      '--missing',
      '--accounts',
      'cuentas.local.json',
      '--env-file',
      '.env.cuentas.local',
    ]),
  ).toMatchObject({
    mode: 'dev',
    profile: 'cuenta-01',
    all: false,
    accounts: 'cuentas.local.json',
    'env-file': '.env.cuentas.local',
    'capture-only': true,
    missing: true,
  });
});

it('sólo utiliza datos ficticios cuando se solicita el modo demo', () => {
  expect(parseManualOptions(['--mode', 'demo', '--all']).mode).toBe('demo');
});

it.each([undefined, '', 'development', 'test'])(
  'permite las herramientas en el entorno de desarrollo o pruebas: %s',
  (nodeEnv) => {
    expect(() => assertManualDevelopment(nodeEnv)).not.toThrow();
  },
);

it.each(['production', 'staging'])('rechaza la generación fuera de desarrollo: %s', (nodeEnv) => {
  expect(() => assertManualDevelopment(nodeEnv)).toThrow('sólo para desarrollo');
});

it.each(['docx', 'pdf', 'ambos'])('admite publicar el formato %s', (format) => {
  expect(parseManualOptions(['--all', '--format', format]).format).toBe(format);
});

it.each([
  [],
  ['--all', '--profile', 'cuenta-01'],
  ['--profile', '../otra-cuenta'],
  ['--profile', ''],
  ['--all', '--mode', 'otro'],
  ['--all', '--mode', 'live'],
  ['--all', '--format', 'html'],
  ['--env-file', '--all'],
  ['--profile'],
  ['--desconocida'],
  ['ambos'],
])('rechaza opciones ambiguas o incompletas: %j', (...args) => {
  expect(() => parseManualOptions(args)).toThrow();
});

it('permite consultar la ayuda sin cuentas ni credenciales', () => {
  expect(parseManualOptions(['--help'])).toMatchObject({ help: true, all: false });
});
