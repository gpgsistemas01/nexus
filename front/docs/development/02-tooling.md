# 2. Herramientas del frontend

La [guía de inicio](01-getting-started.md) prepara el entorno. La consulta de
[Comandos para desarrollo](00-commands.md) reúne los scripts de Vue, API, pruebas,
capturas y publicación. Esta página explica las herramientas.

## Configuración y compatibilidad

| Fuente | Configura |
| --- | --- |
| [package.json](../../package.json) y [lockfile](../../package-lock.json) | Versiones de Node y dependencias instaladas con `npm ci`. |
| [tsconfig.json](../../tsconfig.json) | Entornos de aplicación, configuración y pruebas. |
| [ESLint](../../eslint.config.js) y [Prettier](../../prettier.config.js) | Análisis de código y formato. |
| [CI](../../../.github/workflows/ci.yml) | Node 24, instalación, comprobaciones y reportes automatizados. |

El [estándar de formato](../architecture/coding-standards/02-format-of-the-file.md)
y las [reglas de imports](../architecture/coding-standards/04-imports-exports-and-dependencies.md)
definen las convenciones que comprueban esas herramientas.

Ante un aviso de dependencia, `npm explain <paquete>` identifica quién la instala.
`npm audit` revisa vulnerabilidades; un aviso de obsolescencia no equivale a una.

## Tipos y editor

Usa **Vue - Official** y **ESLint**, recomendadas en `.vscode/extensions.json`.
Desactiva Vetur en este proyecto para evitar diagnósticos duplicados.

Vite actualiza la vista durante `dev`; para comprobar tipos utiliza el editor o
`npm run type-check:watch` en otra terminal. `build` ejecuta `vue-tsc --build` antes
de compilar. Los imports TypeScript usan `.js` y los componentes, `.vue`.

`npm run format` aplica el formato versionado. Puedes activar Prettier y «Format
on Save» en el editor; los comandos y CI también comprueban el resultado.

CI usa Node 24 para ambas aplicaciones y ejecuta los eventos push y pull request.
Un cambio nuevo cancela la ejecución anterior del mismo evento y rama o PR.
