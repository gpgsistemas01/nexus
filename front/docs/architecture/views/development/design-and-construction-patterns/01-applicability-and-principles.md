# 1. Patrones y principios de diseño en Vue

Esta guía identifica las decisiones que sí tienen consumidores en el código actual.
La [arquitectura](../code-structure.md) conserva organización y fronteras; el
[índice documental](../../../../index.md) explica qué criterios se adaptan a Vue. El catálogo
separa patrones, mecanismos del framework, tipos y principios de revisión.

## Aplicabilidad comprobada

| Decisión aplicada | Clasificación | Consumidores y límite |
| --- | --- | --- |
| Contenedor/presentación | Patrón de separación de responsabilidades. | Las páginas coordinan; tablas y formularios reciben props y emiten eventos. No hay controladores Express en Vue. |
| Composables y operaciones por callback | Composición reactiva y estrategia funcional. | `usePagedList`, `useRemoteLookup`, `useDocumentRead` y `useRecordSave` conservan contratos distintos. No necesitan clases Strategy ni un estado global por formulario. |
| Adaptadores HTTP y de datos | Patrón aplicado a fronteras concretas. | Servicios, mappers, `apiClient`, `requestPage` y `confirmMutation`. No prueban independencia completa de Vue, Axios o la API. |
| Slots y composición visual | Mecanismo de Vue que permite reutilizar presentación. | `ServerTable`, `RecordListPanel` y diálogos. No es herencia ni un generador universal de CRUD. |
| Provisión de sesión | Inyección de una instancia mediante Vue y composición del arranque. | `main.ts`, `createAuthSession`, `provide/inject` y guarda de Router. No equivale a un singleton global ni concede autorización en Express. |
| Fábricas de esquemas | Funciones que construyen validación según contexto. | `createIssueValidationSchema` y `createPurchaseValidationSchema`. No son Abstract Factory ni una máquina de estados. |
| Uniones discriminadas | Mecanismo del sistema de tipos de TypeScript. | `IssueTarget`, `PurchaseWriteTarget` y `PurchaseDetailChange`. No validan JSON recibido ni sustituyen reglas del servidor. |
| SOLID | Principios de evaluación, con aplicación parcial. | Se revisan cohesión, contratos y dependencias funcionales. No se inventa herencia para representar Liskov. |

No se documentan como implementados Pinia, Zod, Tailwind, Atomic Design, CQRS,
Event Sourcing, un bus global de eventos ni una arquitectura hexagonal completa.
Tampoco se atribuyen al cliente las transacciones, repositories o middleware de
Express. Vue Router y las bibliotecas instaladas son herramientas: su presencia
no constituye por sí sola un patrón de diseño.

## Modelo general y aplicación en código

Los [capítulos de diagramas](index.md) describen cada decisión con problema,
justificación, contrato, código, límites y evidencia. La columna general explica
la colaboración sin nombres del proyecto; la aplicada usa archivos/símbolos reales.
Una misma figura aplicada no pretende documentar todos los módulos ni todas las
letras de SOLID.

| Decisión | Modelo general | Aplicación existente |
| --- | --- | --- |
| Contenedor/presentación | [DIA-VUE-GEN-001](02-container-and-presentation.md#modelo-general-de-contenedor-y-presentación) | [DIA-VUE-APL-001: Catálogos](02-container-and-presentation.md#aplicación-en-la-página-de-catálogos). |
| Composables/callbacks | [DIA-VUE-GEN-002](03-composables-and-callbacks.md#modelo-general-de-composición-por-callback) | [DIA-VUE-PAT-001: listado](03-composables-and-callbacks.md#dependencias-y-composición-de-un-listado) y [DIA-VUE-PAT-002: transición de merma](03-composables-and-callbacks.md#coordinación-de-la-alternativa-de-merma-duplicada). |
| Adaptadores | [DIA-VUE-GEN-003](04-http-and-data-adapters.md#modelo-general-de-adaptación-de-una-lectura) | [DIA-VUE-APL-003: lectura de Compra](04-http-and-data-adapters.md#aplicación-al-consultar-una-compra). |
| Slots | [DIA-VUE-GEN-004](05-slots-and-visual-composition.md#modelo-general-de-composición-por-slots) | [DIA-VUE-APL-004: celdas de Catálogos](05-slots-and-visual-composition.md#aplicación-a-las-celdas-de-catálogos). |
| Provisión de sesión | [DIA-VUE-GEN-005](06-session-provision.md#modelo-general-de-provisión-de-estado-de-aplicación) | [DIA-VUE-APL-005: arranque y consumidores](06-session-provision.md#aplicación-en-el-arranque-de-vue). |
| Fábricas de esquemas | [DIA-VUE-GEN-006](07-schema-factories.md#modelo-general-de-construcción-de-un-esquema) | [DIA-VUE-APL-006: validación de Salidas](07-schema-factories.md#aplicación-al-esquema-del-editor-de-salidas). |
| Selección dependiente | [DIA-VUE-GEN-002](03-composables-and-callbacks.md#modelo-general-de-composición-por-callback) | [DIA-VUE-PAT-004: selección de Inventario](03-composables-and-callbacks.md#selección-dependiente-de-inventario). |
| Alta contextual de proveedor en Inventario | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [DIA-VUE-APL-007](09-contextual-creation.md#caso-1-proveedor-desde-inventario). |
| Alta de proveedor/artículo en Compras | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [DIA-VUE-APL-008](09-contextual-creation.md#proveedor-desde-el-encabezado) y [010](09-contextual-creation.md#artículo-desde-una-partida). |
| Alta de cliente en Salidas | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [DIA-VUE-APL-009](09-contextual-creation.md#caso-3-cliente-desde-salidas). |

La [composición de altas contextuales](09-contextual-creation.md) conserva otro par completo: `DIA-VUE-GEN-007` explica el modelo; `DIA-VUE-APL-007`, `008`, `009` y `010` concretan Inventario, Compras y Salidas con sus eventos, callbacks y propietarios reales. La selección dependiente y el guardado mantienen su separación en `DIA-VUE-PAT-004`.

## Colaboraciones que combinan mecanismos

La [revisión de Salidas/Compras](08-document-responsibilities.md) conserva otras
preguntas, sin repetir los diagramas generales:

| Pregunta | Figura aplicada |
| --- | --- |
| ¿Quién presenta, valida y guarda el documento? | [DIA-VUE-DOC-001](08-document-responsibilities.md#composición-del-editor-y-adaptadores). |
| ¿Cuándo se confirma la escritura y se recarga? | [DIA-VUE-DOC-002](08-document-responsibilities.md#secuencia-de-guardado-confirmado). |
| ¿Cómo se compone un alta de otro dominio? | [DIA-VUE-DOC-003](08-document-responsibilities.md#composición-entre-dominios-para-altas-rápidas). |

La sesión Vue tiene sus propios colaboradores y secuencia HTTP,
documentados mediante sus componentes, estado y transporte reales. La frontera
compartida de seguridad se explica en [entradas y salida segura](../../logical/input-security.md).

## Dependencias y composición de un listado

La figura canónica `DIA-VUE-PAT-001` identifica el
[capítulo de composables](03-composables-and-callbacks.md#dependencias-y-composición-de-un-listado).
Esta sección mantiene la navegación previa sin duplicar la imagen.

## Evaluación de SOLID

| Principio | Aplicación observable | Límite de la evaluación |
| --- | --- | --- |
| S — Responsabilidad única | Presentación, coordinación reactiva, reglas públicas y transporte están separados. | Una page coordina varias operaciones de un mismo caso; su tamaño no exige por sí solo más capas. |
| O — Abierto/cerrado | Slots, configuración y callbacks extienden marcos compartidos. | Otra semántica de stock o recuperación exige un flujo específico; no se añade una bandera por cada excepción a un composable universal. |
| L — Sustitución | No hay una jerarquía de subtipos de clases que permita afirmar cumplimiento de Liskov. Se revisa como criterio práctico la sustitución de callbacks: consulta, `AbortSignal`, resultados y rechazo ante error. | La analogía funcional no es una prueba formal del principio. TypeScript comprueba firmas; las pruebas comprueban comportamiento. Ocultar errores o cambiar el significado del total rompe el contrato. |
| I — Segregación | Props/eventos y tipos como `LookupState` exponen lo que la presentación necesita. | No se entrega la sesión, el cliente HTTP o todo el editor a un botón o tabla. |
| D — Inversión | `usePagedList` recibe `request`; `useRemoteLookup` recibe su consulta; los módulos aportan adaptadores concretos. | Es inversión por contratos funcionales en esos puntos; el frontend sigue usando Vue y Axios. No se declara independencia completa de frameworks. |

La evaluación usa [SOLID de Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
como criterio de revisión y [composables de Vue](https://vuejs.org/guide/reusability/composables.html)
como mecanismo. No se agregan herencia, stores por formulario ni un contenedor de
inyección para representar cada letra.

## Evidencia y mantenimiento

Cada capítulo enlaza pruebas de sus consumidores y distingue el contrato observado
por unitarias, componentes o navegador. La [guía de pruebas](../../../../testing/index.md) conserva
el diseño selectivo y sus identificadores; los resultados reales permanecen en CI
o en la revisión. Las simulaciones de la API no demuestran persistencia del servidor
ni capacidad bajo carga. Al cambiar el código se revisa la figura aplicada; al
cambiar el contrato común también se revisa el modelo general y sus consumidores.
