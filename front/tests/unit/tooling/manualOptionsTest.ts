import { expect, it } from 'vitest';
import { parseManualOptions } from '../../../scripts/manual/options.mjs';
import {
  assertManualDevelopment,
  createManualWebServer,
} from '../../../scripts/manual/environment.mjs';

it('exporta cuentas configuradas sin opciones de navegador ni credenciales', () => {
  const options = parseManualOptions(['export', '--all']);
  expect(options).toMatchObject({
    command: 'export',
    mode: 'dev',
    accounts: 'manual.accounts.local.json',
    all: true,
    format: 'ambos',
  });
  expect(options).not.toHaveProperty('env-file');
  expect(options).not.toHaveProperty('missing');
  expect(options).not.toHaveProperty('fresh');
});

it('permite capturar una cuenta y reanudar usando sus archivos seleccionados', () => {
  expect(
    parseManualOptions([
      'capture',
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
    command: 'capture',
    missing: true,
  });
});

it.each(['capture', 'export'])(
  'sólo utiliza datos ficticios en %s al solicitar demo',
  (command) => {
    expect(parseManualOptions([command, '--mode', 'demo', '--all']).mode).toBe('demo');
  },
);

it.each([['--all'], ['--profile', 'cuenta-01']])(
  'recupera faltantes por defecto: %j',
  (...args) => {
    expect(parseManualOptions(['capture', ...args])).toMatchObject({ missing: true });
    expect(parseManualOptions(['capture', ...args, '--fresh'])).toMatchObject({
      missing: false,
      fresh: true,
    });
  },
);

it.each([undefined, '', 'development', 'test'])(
  'permite las herramientas en el entorno de desarrollo o pruebas: %s',
  (nodeEnv) => {
    expect(() => assertManualDevelopment(nodeEnv)).not.toThrow();
  },
);

it.each(['production', 'staging'])('rechaza la generación fuera de desarrollo: %s', (nodeEnv) => {
  expect(() => assertManualDevelopment(nodeEnv)).toThrow('sólo para desarrollo');
});

it.each([
  ['http://127.0.0.1:5173', '127.0.0.1', '5173'],
  ['http://localhost:5190', 'localhost', '5190'],
  ['http://[::1]:5173', '::1', '5173'],
])(
  'prepara Vue en el origen configurado %s y reutiliza un servidor existente',
  (baseUrl, host, port) => {
    expect(createManualWebServer({ mode: 'dev', baseUrl })).toEqual({
      command: `npm run dev -- --host ${host} --port ${port}`,
      url: baseUrl,
      reuseExistingServer: true,
      timeout: 60_000,
    });
  },
);

it('la demostración mantiene su servidor aislado y no reutiliza un servicio real', () => {
  expect(createManualWebServer({ mode: 'demo', baseUrl: 'http://127.0.0.1:5177' })).toMatchObject({
    reuseExistingServer: false,
  });
});

it('un origen HTTPS local requiere su servicio TLS ya configurado', () => {
  expect(createManualWebServer({ mode: 'dev', baseUrl: 'https://localhost:5173' })).toBeUndefined();
});

it.each(['docx', 'pdf', 'ambos'])('admite publicar el formato %s', (format) => {
  expect(parseManualOptions(['export', '--all', '--format', format])).toMatchObject({ format });
});

it.each([
  [],
  ['--all'],
  ['export', '--all', '--profile', 'cuenta-01'],
  ['capture', '--all', '--missing', '--fresh'],
  ['export', '--all', '--fresh'],
  ['export', '--all', '--missing'],
  ['export', '--all', '--env-file', '.env.manual.local'],
  ['capture', '--all', '--format', 'pdf'],
  ['export', '--all', '--capture-only'],
  ['export', '--profile', '../otra-cuenta'],
  ['export', '--profile', ''],
  ['export', '--all', '--mode', 'otro'],
  ['export', '--all', '--mode', 'live'],
  ['export', '--all', '--format', 'html'],
  ['capture', '--env-file', '--all'],
  ['export', '--profile'],
  ['export', '--desconocida'],
  ['ambos'],
])('rechaza opciones ambiguas o incompletas: %j', (...args) => {
  expect(() => parseManualOptions(args)).toThrow();
});

it.each([['--help'], ['capture', '--help'], ['export', '--help']])(
  'consulta ayuda sin cuentas: %j',
  (...args) => {
    expect(parseManualOptions(args)).toMatchObject({ help: true });
  },
);
