# 3. Estándar de codificación Vue y TypeScript

## Propósito y alcance

Estas reglas aplican a `front/src`, pruebas, configuración y herramientas documentales del frontend. Se basan en la implementación y configuración versionada; permiten revisar el cliente sin consultar un estándar de Express. La estructura del cliente distingue presentación, coordinación reactiva y transporte.

## Formato del archivo y separación visual

- SFC y TypeScript usan cuatro espacios; pruebas y `package.json`, dos. Se conserva LF, salto de línea final, comillas simples y punto y coma conforme a Prettier y `.editorconfig`.
- Un atributo por línea en templates cuando corresponda al formateador. Bloques `script`, `template` y `style` separados por línea vacía; no se agrupan cierres como `><VBtn` para ahorrar líneas.
- Imports al principio, con una línea vacía antes del código. Funciones y bloques se separan; después de una guarda `if` hay línea vacía antes de la siguiente fase.
- Una fase semántica puede separarse por una línea vacía aunque el formateador no la inserte. No se agregan varias líneas vacías para sustituir una función clara o un comentario útil.
- `npm run format` corrige ESLint y luego Prettier. `format:check` comprueba formato; `lint` comprueba también separaciones y convenciones Vue. Su alcance permanece en el frontend.

## Nombres y ubicación

| Elemento | Convención y ejemplo actual |
| --- | --- |
| Componentes y páginas | PascalCase: `RemoteSelect.vue`, `InventoryEditorPage.vue`. El nombre expresa su función; Page/Workspace coordina, Form/Table presenta. |
| Composable | `use` seguido del comportamiento: `useInventorySelection`, `useRecordSave`. Cada llamada crea estado propio salvo la sesión explícitamente proporcionada. |
| Función pura | Verbo y resultado: `mapPurchaseFormToRequest`, `calculatePurchaseTotals`, `buildInventoryPayload`. No prefijos de hooks si no utiliza reactividad/ciclo de vida. |
| Tipos | PascalCase y contrato concreto: `LookupItem`, `IssueWriteTarget`, `PurchaseDetailChange`. Campos y funciones en camelCase. |
| Booleanos | Expresan una condición: `isSubmitting`, `isDisabled`, `canCreateSupplier`, `hasMore`. Evitar negaciones dobles o una bandera para varios modos incompatibles. |
| Pruebas | Carpeta del nivel/dominio, sufijo `Test.ts` en unitarias y `.spec.ts` en navegador. El título describe condición y efecto, no una llamada privada. |
| Herramientas Node | `front/scripts/*.mjs`, fuera de `src` y del bundle. Imports conservan la extensión real del archivo. |

No se crean carpetas vacías ni barriles que sólo oculten el propietario. Un archivo se divide por responsabilidades que cambian de forma independiente; el número de líneas no fija un límite automático.

## Capas y dependencias

| Propietario | Responsabilidad y dependencia admisible |
| --- | --- |
| `app` | Arranque, router, sesión proporcionada, layout y composición entre módulos mediante Workspaces. |
| `modules/<dominio>/pages` | Componer vista, permisos, estado y operaciones; conectar props/eventos a composables. Puede usar el contrato de acceso de aplicación. |
| `components` | Presentar props, emitir intenciones y mantener estado visual local. No importar HTTP, sesión, stores, validadores ni VeeValidate. |
| `composables` | Estado y ciclo de una interacción: captura, consulta, selección o recuperación. Recibir operaciones variables por callback cuando hay consumidores equivalentes. |
| `services` / `mappers` | Traducir transporte/DTO y contratos de dominio. No importar Vue, Router, páginas, componentes, composables o sesión. |
| `shared` | Comportamiento y contratos transversales sin dependencia de `app` o módulos. Recibe callbacks; no conoce permisos/endpoints de un dominio. |

La presentación no llama `fetch`, XMLHttpRequest, Axios o Storage; tampoco a través de `window`/`globalThis`. Un módulo no importa páginas privadas de otro: el Workspace de `app/pages` compone Directorio e Inventario con Compras o Salidas.

## Imports y exports

Dependencias externas, constantes, colaboradores y tipos se mantienen en un orden estable. Los tipos pueden importarse con `import type`; no se arrastran dependencias de ejecución sólo para describir un contrato. Módulos TypeScript de la aplicación se importan con `.js`, que Vite/TypeScript resuelven al `.ts`; SFC con `.vue`; herramientas `.mjs` con su extensión real.

Los alias `@nexus/*` señalan código público compilable para el navegador. No autorizan importar Prisma, middleware o secretos. Los imports dinámicos responden a carga diferida de rutas/arranque; no ocultan ciclos ni errores mediante `try/catch` alrededor de imports.

## Contratos SFC y propietario del estado

Se usa `<script setup lang="ts">`, props/eventos tipados y orden de macros `defineOptions`, `defineProps`, `defineEmits`, `defineSlots` cuando existan. Las props no se mutan. La página o composable propietario aplica el cambio; un componente emite la intención con los datos necesarios.

Ejemplo del contrato aplicado al selector, abreviado para explicar la frontera:

```ts
const emit = defineEmits<{
    'update:modelValue': [value: string];
    search: [value: string];
    create: [search: string];
}>();
```

`create` expresa intención. El selector no registra la entidad, no inventa un UUID ni importa su editor. `LookupCreation` transporta texto/callback al Workspace; el módulo conserva las reglas para aceptar la opción confirmada.

Se accede con `.value` a refs en script; el template desempaqueta refs expuestas conforme a Vue. No se desestructura una prop reactiva para congelar por accidente un valor que debe seguir cambios. Los modos inmutables por instancia se documentan y sus páginas desmontan/recrean el editor al cambiar operación.

## Formularios, validación y payloads

VeeValidate pertenece al composable, no al formulario presentacional. Se registran campos y se conserva `validateOnMount: false`. `useFormInteraction` distingue captura del usuario de precarga programática: mover foco sin editar no dispara errores; enviar valida toda la captura.

Las reglas públicas se reutilizan desde sus alias; se documenta qué comprueban sin duplicar su implementación en otro validador. Contraseñas mantienen contenido exacto. Se recortan nombres/textos sólo cuando el contrato lo permite. No se aplica una función genérica para borrar símbolos de todo input.

Mappers/payloads usan listas explícitas por operación: no se envía todo un objeto reactivo mediante spread. `expectedVersion` viene de la lectura que originó la captura; crear no la fabrica. `operationId` de merma se conserva en reintentos. Los totales, saldos, roles y conversiones del cliente no sustituyen la autoridad de la API.

## Asincronía y errores

- Una consulta acepta `AbortSignal`; cambiar contexto y desmontar cancela o invalida respuestas antiguas. El callback de un formulario cerrado no actualiza otra captura.
- `isSubmitting` bloquea acciones duplicadas de UI. No demuestra idempotencia en servidor ni reemplaza `operationId` en sus flujos.
- Se conserva carga/error/vacío/éxito por operación. Un fallo de catálogo no borra silenciosamente el formulario; un fallo de reporte no se confunde con el del listado.
- `ApiError` y normalización compartida traducen el transporte. Validación conserva errores de campo; 401/403 resuelven sesión/acceso; conflicto mantiene captura y exige recargar.
- `confirmMutation` comprueba el código esperado antes de anunciar éxito. No se construyen códigos concatenando nombre de recurso/operación.
- Los fallos de red no provocan reintentos automáticos de escrituras. La renovación de sesión y la recuperación idempotente tienen coordinación propia.
- `try/catch` rodea una operación que puede fallar y permite traducir/recuperar; no oculta todos los errores con un éxito por defecto. `finally` libera el estado pendiente.

## Presentación, estilos y seguridad

Se usa tema/defaults de Vuetify y estilos compartidos para tablas/modales. CSS scoped se reserva al componente; `:deep` se limita al detalle del control adaptado. Slots componen celdas/contenidos sin duplicar el marco ni introducir otro motor de DOM.

El texto recibido usa interpolación o propiedades de texto. `v-html` está prohibido por lint. SweetAlert2 recibe `titleText`/`text`; no se inserta un mensaje de API como HTML. Foco, Escape, modal móvil y acciones accesibles se apoyan en los componentes existentes. No se usa un plugin y Vue para controlar simultáneamente el mismo nodo.

No se registran contraseñas, cookies, tokens o datos privados en consola. Las variables `VITE_*` son públicas. La persistencia local de una captura de merma tiene su propietario y finalidad; no se generaliza a guardar credenciales.

## Pruebas, documentación y revisión

Antes de cambiar pruebas se identifica riesgo, condición y oráculo conforme al [plan local](../testing/05-test-plan.md). Se reutilizan fixtures/harnesses y se comprueban efectos visibles, payloads y estados; no llamadas privadas o clases CSS sin comportamiento. Una simulación de API no acredita persistencia real.

Un cambio de responsabilidad actualiza su diagrama aplicado y guía de módulo. El inventario se regenera con `npm run docs:generate`; las decisiones se redactan manualmente. Antes de revisar: diff, referencias, formato/lint, pruebas pertinentes, tipos/build y `docs:check`. Diagramas modificados requieren renderizado y exportación DOCX/PDF representativa.
