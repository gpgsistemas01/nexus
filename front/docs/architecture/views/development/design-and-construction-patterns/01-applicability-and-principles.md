# 1. Patrones y principios de diseño en Vue

El cliente reutiliza componentes, composables, adaptadores y funciones de esquema.
La tabla identifica su naturaleza y los puntos donde se aplican.

## Aplicabilidad comprobada

| Mecanismo | Naturaleza | Aplicación en Nexus |
| --- | --- | --- |
| Contenedor/presentación | Separación de responsabilidades mediante componentes. | Páginas y composables coordinan el caso; formularios y tablas reciben props y emiten eventos. |
| Composables y callbacks | Reutilización de lógica reactiva con operaciones configurables. | `usePagedList`, `useRemoteLookup`, `useDocumentRead` y `useRecordSave` reciben consultas o mutaciones por función. |
| Adaptadores HTTP y de datos | Adaptación entre contratos de red y modelos del cliente. | Servicios, mappers, `apiClient`, `requestPage` y `confirmMutation`. |
| Slots | Composición visual de Vue. | `ServerTable`, `RecordListPanel` y diálogos reciben contenido definido por su consumidor. |
| Provisión de sesión | Inyección de una instancia de aplicación. | `main.ts` crea `AuthSession`; Router y descendientes consumen esa instancia. |
| Fábricas de esquemas | Funciones que construyen validadores por contexto. | `createIssueValidationSchema` y `createPurchaseValidationSchema`. |
| Uniones discriminadas | Modelado de variantes con TypeScript. | `IssueTarget`, `PurchaseWriteTarget` y `PurchaseDetailChange` relacionan modo, datos y operación. |

## Modelo general y aplicación en código

El modelo general identifica roles; la aplicación usa archivos y símbolos del
proyecto. Los capítulos enlazados desarrollan sus contratos y límites.

| Decisión | Modelo general | Aplicación existente |
| --- | --- | --- |
| Contenedor/presentación | [DIA-VUE-GEN-001](02-container-and-presentation.md#modelo-general-de-contenedor-y-presentación) | [DIA-VUE-APL-001: Catálogos](02-container-and-presentation.md#aplicación-en-la-página-de-catálogos). |
| Composables/callbacks | [DIA-VUE-GEN-002](03-composables-and-callbacks.md#modelo-general-de-composición-por-callback) | [DIA-VUE-PAT-001: listado](03-composables-and-callbacks.md#dependencias-y-composición-de-un-listado) y [DIA-VUE-PAT-002: transición de merma](03-composables-and-callbacks.md#coordinación-de-la-alternativa-de-merma-duplicada). |
| Adaptadores | [DIA-VUE-GEN-003](04-http-and-data-adapters.md#modelo-general-de-adaptación-de-una-lectura) | [DIA-VUE-APL-003: lectura de Compra](04-http-and-data-adapters.md#aplicación-al-consultar-una-compra). |
| Regiones de slots | [DIA-VUE-GEN-004](05-slots-and-visual-composition.md#modelo-general-de-composición-por-slots) | [DIA-VUE-APL-004: celdas de Catálogos](05-slots-and-visual-composition.md#aplicación-a-las-celdas-de-catálogos). |
| Evaluación de slots | [DIA-VUE-GEN-008](05-slots-and-visual-composition.md#evaluación-general-de-un-slot-con-alcance) | [DIA-VUE-APL-011: renderizado y evento de celda](05-slots-and-visual-composition.md#evaluación-de-una-celda-de-catálogos). |
| Provisión de sesión | [DIA-VUE-GEN-005](06-session-provision.md#modelo-general-de-provisión-de-estado-de-aplicación) | [DIA-VUE-APL-005: arranque y consumidores](06-session-provision.md#aplicación-en-el-arranque-de-vue). |
| Fábricas de esquemas | [DIA-VUE-GEN-006](07-schema-factories.md#modelo-general-de-construcción-de-un-esquema) | [DIA-VUE-APL-006: validación de Salidas](07-schema-factories.md#aplicación-al-esquema-del-editor-de-salidas). |
| Ejecución del esquema | [DIA-VUE-GEN-009](07-schema-factories.md#ejecución-general-del-producto-de-la-fábrica) | [DIA-VUE-APL-012: captura vigente de Salidas](07-schema-factories.md#ejecución-del-esquema-de-salidas). |
| Selección dependiente | [DIA-VUE-GEN-002](03-composables-and-callbacks.md#modelo-general-de-composición-por-callback) | [DIA-VUE-PAT-004: selección de Inventario](03-composables-and-callbacks.md#selección-dependiente-de-inventario). |
| Alta contextual de proveedor en Inventario | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [Apertura: APL-007](09-contextual-creation.md#caso-1-proveedor-desde-inventario) y [retorno: APL-013](09-contextual-creation.md#retorno-del-proveedor-a-inventario). |
| Alta de proveedor en Compras | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [Apertura: APL-008](09-contextual-creation.md#proveedor-desde-el-encabezado) y [retorno: APL-014](09-contextual-creation.md#retorno-del-proveedor-a-compras). |
| Alta de artículo en Compras | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [Apertura: APL-010](09-contextual-creation.md#artículo-desde-un-detalle) y [retorno: APL-015](09-contextual-creation.md#retorno-del-artículo-al-detalle). |
| Alta de cliente en Salidas | [DIA-VUE-GEN-007](09-contextual-creation.md#modelo-general) | [Apertura: APL-009](09-contextual-creation.md#caso-3-cliente-desde-salidas) y [retorno: APL-016](09-contextual-creation.md#retorno-del-cliente-a-salidas). |

## Colaboraciones que combinan mecanismos

La [composición de Salidas/Compras](08-document-responsibilities.md) conserva otras
preguntas, sin repetir los diagramas generales:

| Pregunta | Figura aplicada |
| --- | --- |
| ¿Quién presenta, valida y guarda el documento? | [DIA-VUE-DOC-001](08-document-responsibilities.md#composición-del-editor-y-adaptadores). |
| ¿Cuándo se confirma la escritura y se recarga? | [DIA-VUE-DOC-002](08-document-responsibilities.md#secuencia-de-guardado-confirmado). |

La sesión Vue tiene sus propios colaboradores y secuencia HTTP,
documentados mediante sus componentes, estado y transporte reales. La frontera
compartida se explica en la [integración de reglas públicas](../input-handling.md)
y en el [estándar de seguridad](../../../security-standards.md).

## Aplicación de SOLID

| Principio | Aplicación en el código |
| --- | --- |
| Responsabilidad única | Páginas/composables coordinan; componentes presentan; mappers transforman; servicios realizan HTTP. |
| Abierto/cerrado | Slots, configuración y callbacks permiten variar marcos compartidos sin copiar su implementación. |
| Sustitución | Los callbacks deben conservar entradas, resultado, errores y `AbortSignal` del contrato configurado. En estos coordinadores no hay una jerarquía de clases. |
| Segregación de interfaces | Props, eventos y contratos como `LookupState` entregan a cada consumidor los datos y operaciones que necesita. |
| Inversión de dependencias | Los módulos proporcionan consultas y mutaciones a coordinadores compartidos mediante funciones. |

Referencia: [principios SOLID](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html).
