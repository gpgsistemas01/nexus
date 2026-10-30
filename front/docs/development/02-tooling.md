# 2. Herramientas del frontend

La [guía de inicio](01-getting-started.md) prepara el entorno. Esta página reúne
los comandos y las herramientas utilizadas para trabajar en Vue.

## Comandos del frontend

Ejecutar desde `front/`. Desde la raíz, sustituir `npm run` por
`npm --prefix front run`.

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Inicia Vite con actualización automática. |
| `npm run type-check` | Comprueba tipos de componentes, código, pruebas y configuración. |
| `npm run type-check:watch` | Mantiene la comprobación de tipos en otra terminal. |
| `npm run format` | Aplica correcciones de lint y el formato versionado. |
| `npm run format:check` | Comprueba el formato sin modificar archivos. |
| `npm run lint` | Comprueba las reglas ESLint sin modificar archivos. |
| `npm run lint:fix` | Aplica las correcciones automáticas de ESLint. |
| `npm run test:unit` | Ejecuta las pruebas unitarias una vez. |
| `npm run build` | Comprueba tipos y genera `dist/`. |
| `npm run build-only` | Sólo compila; no sustituye la comprobación de tipos. |
| `npm run preview` | Sirve localmente `dist/` para revisarlo. |
| `npm run check` | Ejecuta formato, lint, unitarias y build con tipos. |

La [ejecución de pruebas](../testing/06-test-files-and-credentials.md) contiene la
instalación de Chromium, los comandos de navegador y la preparación de sistema.
La [publicación documental](../governance/02-generation-and-publication.md)
conserva los comandos `docs:*` y sus resultados.

## Configuración y compatibilidad

| Fuente | Configura |
| --- | --- |
| [package.json](../../package.json) y [lockfile](../../package-lock.json) | Versiones de Node y dependencias instaladas con `npm ci`. |
| [tsconfig.json](../../tsconfig.json) | Entornos de aplicación, configuración y pruebas. |
| [ESLint](../../eslint.config.js) y [Prettier](../../prettier.config.js) | Análisis de código y formato. |
| [CI](../../../.github/workflows/ci.yml) | Versiones de Node, instalación, comprobaciones y reportes automatizados. |

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

## Interfaz y formularios

Vuetify proporciona controles y VeeValidate conserva la captura y sus errores:

| Ámbito | Vuetify | VeeValidate: composables de captura |
| --- | --- | --- |
| Login | `LoginPage`, `LoginForm`. | `useLoginForm`. |
| Almacén | `InventoryPage` y componentes de inventario. | `useInventoryEditor`. |
| Catálogos | `CatalogPage` y formularios de catálogo. | `useCatalogEditor`. |
| Identidad | `IdentityPage`, `PersonForm`, `UserForm`. | `usePersonEditor`, `useUserEditor`. |
| Directorio | `DirectoryPage`, `DirectoryForm`. | `useDirectoryEditor`. |
| Compras | Páginas, editor, detalles y corrección. | `usePurchaseEditor`, `usePurchaseLineEntry`, `usePurchaseCorrection`. |
| Salidas | Páginas, editor, detalles, surtido y devolución. | `useIssueEditor`, `useIssueLineEntry`, `useIssueReturn`. |


Los filtros tienen su propio estado; usar Vuetify no exige que cada control use
VeeValidate. Axios realiza el transporte mediante `apiClient` y SweetAlert2 muestra
los avisos mediante `feedback`.

La [composición visual](../architecture/views/logical/components/08-shared-ui.md)
localiza controles y estilos; los [contratos](../architecture/contracts/index.md)
definen datos, eventos y respuestas.
