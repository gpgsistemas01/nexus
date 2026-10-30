# 2. Herramientas del frontend

Esta guía explica los comandos del frontend, su comprobación de código y las
bibliotecas que utiliza la interfaz. La instalación inicial se describe en
[Preparar e iniciar el proyecto](01-getting-started.md).

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

La base usa Vue 3, Vue Router 5 y Vite, con TypeScript estricto. `vue-tsc` comprueba
componentes y módulos; ESLint analiza errores comunes de JavaScript/TypeScript y Vue.
El preset de Vue es `recommended`; `eslint-config-prettier` evita reglas que
compitan con Prettier. `@stylistic/eslint-plugin` y las reglas Vue comprueban
separaciones que Prettier conserva pero no inserta. Las reglas concretas de sangría,
comillas, atributos y líneas vacías están en el
[estándar de formato](../architecture/coding-standards/02-format-of-the-file.md).
ESLint comprueba además las
[fronteras de dependencia](../architecture/coding-standards/04-imports-exports-and-dependencies.md#dirección-admisible).

Se admiten Node.js `^22.22.2 || ^24.15.0 || ^26.12.1`. jsdom 30.1.3 y las
herramientas transitivas de Vue Test Utils 2.5.1 requieren al menos 22.22.2 o
24.15.0 en esas ramas. Node 26.12.1 sigue siendo válido. CI verifica el frontend
con Node 24.15.0 y 26.12.1, e instala con `npm ci --include=dev --engine-strict`.
Cambiar sólo `engines` no actualiza Node en el equipo ni valida sus dependencias.

Las versiones exactas se registran en `package-lock.json` y se instalan con `npm ci`.
Después de descargar cambios que actualicen dependencias, detén Vite y ejecuta
desde la raíz `npm --prefix front ci --include=dev`, seguido de
`npm --prefix front run dev`. Git no actualiza `node_modules`.

### Compatibilidad de herramientas

- Vue Router 5.4.0 utiliza el router explícito, las guardas y la carga diferida
  declarados en `src/app/router/index.ts`.
- Vitest 5.0.5 ejecuta las unitarias en jsdom 30.1.3; Vue Test Utils 2.5.1
  proporciona el montaje de componentes en esas pruebas.
- TypeScript 6.0.3 es compatible con `vue-tsc` y el analizador de ESLint instalado.
  `@typescript-eslint/typescript-estree` declara soporte `>=4.8.4 <6.1.0`;
  ese rango también se revisa al actualizar el compilador.
- `@types/node` conserva la rama 24 para comprobar las APIs del entorno mínimo
  compartido; ejecutar Node 26 no exige usar sus tipos en herramientas que también
  deben funcionar con Node 24.

### Avisos de obsolescencia

Vue Test Utils 2.5.1 usa js-beautify 2.x y glob 13.x. Comprueba el origen de un
aviso de obsolescencia con `npm explain <paquete>` desde
la aplicación afectada. Un aviso de obsolescencia y una vulnerabilidad de
`npm audit` son comprobaciones distintas.

## Tipos y editor

`tsconfig.json` referencia tres entornos: aplicación (DOM/Vite), configuración (Node)
y pruebas (DOM/Node). El código de navegador no recibe por accidente las variables
globales de Node. Los archivos de estado incremental se guardan en `node_modules/.tmp`.
Las importaciones con `.js` resuelven al fuente `.ts`; los componentes usan `.vue`.

`npm run type-check` ejecuta `vue-tsc --build`. `npm run build` lo ejecuta antes de
Vite y falla si hay errores. `npm run dev` mantiene el comportamiento rápido de Vite:
no promete comprobar todos los tipos. En desarrollo usa Vue - Official en VS Code
o `npm run type-check:watch` en una segunda terminal. La terminal y las herramientas de TypeScript muestran los errores durante el desarrollo.

`vite.config.ts` incluye los imports profundos de componentes/directivas Vuetify
en la preparación de dependencias. Así una ruta diferida no provoca una recarga
completa al descubrir esos controles durante el primer acceso después del login.

El repositorio recomienda Vue - Official y ESLint mediante `.vscode/extensions.json`.
VS Code solicita instalar las extensiones; el repositorio no las instala automáticamente.
Si tienes Vetur activo, desactívalo en este proyecto Vue 3 para evitar diagnósticos duplicados.

TypeScript comprueba contratos estáticos; no valida las respuestas reales de una API
ni sustituye las reglas del backend. ESLint puede corregir algunos problemas con
`npm run lint:fix`; no repara automáticamente reglas de negocio ni todos los errores de tipos.

Para el formato usa `npm --prefix front run format` desde la raíz, o
`npm run format` dentro de `front/`. `npm run format:check` comprueba sin modificar.
En VS Code se puede elegir la extensión Prettier como formateador de Vue y TypeScript
y activar «Format on Save»; la configuración versionada determina el resultado.
No hace falta la extensión para ejecutar los comandos ni para CI. El alcance
es código, pruebas, herramientas y configuración del frontend.

## Automatización

CI ejecuta formato, lint, pruebas y build en pasos separados y conserva el reporte
JUnit del frontend como artefacto. Sus disparadores y versiones de Node se declaran
en [ci.yml](../../../.github/workflows/ci.yml).

La [guía de despliegue](03-build-and-deployment.md) explica la construcción de la
imagen y los archivos que contiene cada etapa.

## Interfaz y formularios

Vuetify proporciona los controles visuales; VeeValidate mantiene valores, errores y
validación de los formularios. Sus consumidores actuales son:

| Ámbito | Vuetify | VeeValidate: composables de captura |
| --- | --- | --- |
| Login | `LoginPage`, `LoginForm`. | `useLoginForm`. |
| Almacén | `InventoryPage` y componentes de inventario. | `useInventoryEditor`. |
| Catálogos | `CatalogPage` y formularios de catálogo. | `useCatalogEditor`. |
| Identidad | `IdentityPage`, `PersonForm`, `UserForm`. | `usePersonEditor`, `useUserEditor`. |
| Directorio | `DirectoryPage`, `DirectoryForm`. | `useDirectoryEditor`. |
| Compras | Páginas, editor, detalles y corrección. | `usePurchaseEditor`, `usePurchaseLineEntry`, `usePurchaseCorrection`. |
| Salidas | Páginas, editor, detalles, surtido y devolución. | `useIssueEditor`, `useIssueLineEntry`, `useIssueReturn`. |

Movimientos y los controles compartidos también utilizan Vuetify. Los filtros y
los formularios de cada operación conservan responsabilidades distintas: usar
Vuetify en una página no implica que todos sus controles utilicen VeeValidate.
Las fuentes son los imports de `front/src/modules` y `front/src/shared`; los
[contratos de formularios](../architecture/contracts/form-and-event-contracts.md)
definen props, eventos y resultados entre contenedores.

Axios proporciona el transporte y SweetAlert2 los avisos mediante los adaptadores
propios. La [composición visual](../architecture/views/logical/components/08-shared-ui.md)
localiza esos controles y sus estilos; el [contrato HTTP](../architecture/contracts/client-contracts.md)
define sesión, errores y aceptación de respuestas.
