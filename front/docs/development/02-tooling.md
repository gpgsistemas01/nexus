# 2. Herramientas del frontend

Esta guía conserva herramientas, versiones, formato y ejecución local. El
[diseño de pruebas](../testing/02-test-design.md), las
[fichas de casos](../testing/03-test-cases.md) y la
[cobertura por caso de uso](../testing/04-use-case-coverage.md) tienen propietarios
separados. Los resultados de ejecución permanecen en CI o en la revisión del cambio.

## Decisiones aplicadas

La base usa Vue 3, Vue Router 5 y Vite, con TypeScript estricto. `vue-tsc` comprueba
componentes y módulos; ESLint analiza errores comunes de JavaScript/TypeScript y Vue.
El preset de Vue es `recommended`, con Composition API mediante `script setup`,
orden de macros y convenciones de componentes. Prettier y `.editorconfig` aplican
cuatro espacios en código Vue/TypeScript/CSS y configuración, dos en
pruebas y en el manifiesto `package.json`, comillas simples en JavaScript/TypeScript, punto y coma, LF y
un atributo por línea.
Los templates usan `htmlWhitespaceSensitivity: 'ignore'` para separar contenido,
etiquetas y cierres sin agrupar construcciones como `><VBtn` en la misma línea.
La separación visual de elementos inline debe expresarse en su texto o estilos;
no se depende de espacios accidentales del archivo.
`eslint-config-prettier` evita reglas de formato que compitan con el formateador.
`@stylistic/eslint-plugin` aplica líneas vacías después de imports, entre funciones
y bloques, y después de guardas `if`. Vue comprueba la separación entre bloques
`script`, `template` y `style`. Prettier conserva esas líneas vacías; no las inserta
por sí solo. La separación de fases semánticas dentro de una función sigue siendo
parte de la revisión del código.
`npm run format` ejecuta primero ESLint con corrección y después Prettier;
`npm run format:check` comprueba Prettier y `npm run lint` comprueba también esas
reglas de separación. `npm run check` ejecuta ambas comprobaciones.
Se siguen las reglas de [eslint-plugin-vue](https://eslint.vuejs.org/user-guide/)
y la [configuración de Prettier](https://prettier.io/docs/configuration), adaptadas
al estándar local; Vue no impone una indentación universal.
Las reglas de presentación impiden imports de HTTP, stores, páginas, validadores
y VeeValidate, además de fetch/XMLHttpRequest y almacenamiento local mediante
globales o window/globalThis. No sustituyen la revisión de dependencias indirectas.

Se admiten Node.js `^22.22.2 || ^24.15.0 || ^26.12.1`. jsdom 30.1.3 y las
herramientas transitivas de Vue Test Utils 2.5.1 requieren al menos 22.22.2 o
24.15.0 en esas ramas. Node 26.12.1 sigue siendo válido. CI verifica el frontend
con Node 24.15.0 y 26.12.1, e instala con `npm ci --include=dev --engine-strict`.
Cambiar sólo `engines` no actualiza Node en el equipo ni valida sus dependencias.

El setup enlaza localStorage/sessionStorage con los objetos reales de jsdom antes
de cada caso y restaura los globals al terminar. Así Vitest 5 no conserva por
accidente el Storage nativo de Node 26. Se mantienen las aserciones y el alcance
de las pruebas del login.

Las versiones exactas se registran en `package-lock.json` y se instalan con `npm ci`.
Después de descargar cambios que actualicen dependencias, detén Vite y ejecuta
desde la raíz `npm --prefix front ci --include=dev`, seguido de
`npm --prefix front run dev`. Git no actualiza `node_modules`.

### Versiones y compatibilidad

- Vue Router 5.4.0 conserva el router explícito existente, las guardas y la carga
  diferida; no exige incorporar Pinia ni generación de rutas por archivos.
- Vitest 5.0.5, jsdom 30.1.3 y Vue Test Utils 2.5.1 actualizan la infraestructura
  de pruebas; no se cambia el estado aislado por prueba para optimizar tiempos.
- TypeScript 6.0.3 es compatible con `vue-tsc` y el analizador de ESLint instalado.
  TypeScript 7 queda pendiente: `@typescript-eslint/typescript-estree` declara
  soporte `>=4.8.4 <6.1.0`. El aviso de una versión mayor disponible no basta para
  adoptar un compilador que el conjunto de herramientas todavía no admite.
- `@types/node` conserva la rama 24 para comprobar las APIs del entorno mínimo
  compartido; ejecutar Node 26 no exige usar sus tipos en herramientas que también
  deben funcionar con Node 24.

### Avisos de obsolescencia

Vue Test Utils 2.5.1 usa js-beautify 2.x y glob 13.x. La actualización elimina la
cadena antigua de glob 10.5.0 sin forzar una versión mayor mediante overrides.
Comprueba el origen de cualquier aviso nuevo con `npm explain <paquete>` desde
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
ni sustituye las reglas de Express. ESLint puede corregir algunos problemas con
`npm run lint:fix`; no repara automáticamente reglas de negocio ni todos los errores de tipos.

Para el formato usa `npm --prefix front run format` desde la raíz, o
`npm run format` dentro de `front/`. `npm run format:check` comprueba sin modificar.
En VS Code se puede elegir la extensión Prettier como formateador de Vue y TypeScript
y activar «Format on Save»; la configuración versionada determina el resultado.
No hace falta la extensión para ejecutar los comandos ni para CI. El alcance
es código, pruebas, herramientas y configuración del frontend.

## Automatización y Docker

Desde `front/`, `npm run check` ejecuta formato, lint, pruebas y build con tipos. Desde la raíz
puedes usar `npm --prefix front run check`. CI ejecuta esos controles en pasos separados
y conserva el reporte JUnit del frontend como artefacto. No modifica los disparadores
ni las comprobaciones unitarias e integración del backend.

El Dockerfile instala las herramientas en la etapa de build, copia los tsconfig y
compila con comprobación de tipos. La imagen final contiene sólo Nginx y `dist/`.
Los casos de prueba se ejecutan en CI antes del despliegue, no en Nginx.

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
| Compras | Páginas, editor, partidas y corrección. | `usePurchaseEditor`, `usePurchaseLineEntry`, `usePurchaseCorrection`. |
| Salidas | Páginas, editor, partidas, surtido y devolución. | `useIssueEditor`, `useIssueLineEntry`, `useIssueReturn`. |

Movimientos y los controles compartidos también utilizan Vuetify. Los filtros y
los formularios de cada operación conservan responsabilidades distintas: usar
Vuetify en una página no implica que todos sus controles utilicen VeeValidate.
Las fuentes son los imports de `front/src/modules` y `front/src/shared`; los
[contratos de formularios](../architecture/views/development/frontend-technical-documentation/08-form-and-event-contracts.md)
detallan campos, eventos y validación por módulo.

Axios centraliza el transporte y la renovación de autenticación. La sesión usa
provide/inject por aplicación y las reglas públicas existentes se adaptan a
VeeValidate en los composables; los componentes de presentación reciben props y
emiten eventos. La [selección de controles](../architecture/views/logical/ui-and-http.md)
explica las responsabilidades visuales y HTTP.
