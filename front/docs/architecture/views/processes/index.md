# Procesos y colaboraciones

## Propósito y lectura

Las secuencias explican orden, decisiones y recuperación de colaboradores reales.
Las fichas CU describen el objetivo del actor; esta vista identifica los métodos,
modos, contratos y efectos que lo realizan. Cada figura conserva fuente técnica e
identificador. La API se muestra como frontera externa; el detalle de su transacción
no se atribuye al cliente Vue.

## Organización por responsabilidad

La [lectura y roles de participantes](00-reading-and-roles.md) define granularidad,
símbolos de frontera/coordinación, callbacks y actualizaciones reactivas.

| Sección | Colaboraciones |
| --- | --- |
| [1. Sesión y acceso](01-session/index.md) | Arranque, login, logout y renovación compartida. |
| [2. Coordinación compartida](02-shared-runtime/index.md) | Lista/guardado, documentos, selectores, recarga visible y lectura vigente. |
| [3. Catálogos y directorio](03-catalogs-and-directory/index.md) | Captura por recurso, versión y confirmación. |
| [4. Personas y cuentas](04-identity/index.md) | Responsabilidades, edición y cambio de contraseña. |
| [5. Inventario y mermas](05-warehouse/index.md) | Selecciones dependientes, pendiente, duplicado, baja y vista previa. |
| [6. Compras](06-purchases/index.md) | Lectura/partidas, guardado, corrección y cancelación. |
| [7. Salidas](07-issues/index.md) | Resolución de modo, surtido, devolución y alcance de área. |
| [8. Movimientos y reportes](08-movements-and-reports/index.md) | Aplicación de filtros y descarga recuperable. |

Las secuencias compartidas explican vigencia, transporte y ciclo de vida una sola vez.
Las de dominio desarrollan decisiones de campos, modos y efectos observables. Cada
índice de sección permite leer su colaboración completa y volver al catálogo global.

## Lectura de las colaboraciones

La [leyenda de secuencias](../diagram-reading.md#secuencias) explica participantes,
líneas de vida, numeración y fragmentos. La [actividad de merma](05-warehouse/05-waste-preview.md)
usa un [flujo de decisiones](../diagram-reading.md#mapas-y-actividades).
Las secuencias compartidas conservan ciclo de vida/transporte; las de dominio,
modos y efectos observables. La API permanece como frontera externa.

## Secuencias por operación

| Proceso | Casos/contrato | Figura |
| --- | --- | --- |
| [Arranque, guarda y sesión](01-session/01-bootstrap-and-session.md) | Navegación protegida y CU-AUT | `DIA-VUE-SEQ-001` |
| [Consulta y guardado compartidos](02-shared-runtime/01-list-and-record-save.md) | Listados y escrituras por recurso | `DIA-VUE-SEQ-002` |
| [Captura, login y navegación](01-session/02-login.md) | CU-AUT-01 | `DIA-VUE-SEQ-003` |
| [Alta y edición de catálogos](03-catalogs-and-directory/01-catalog-record-save.md) | CU-CAT-10/11/13/14/16/17/19/20/22/23/25/26; soporte de Directorio | `DIA-VUE-SEQ-004` |
| [Personas y responsabilidades](04-identity/01-person-responsibilities.md) | CU-IDA-02/03 | `DIA-VUE-SEQ-005` |
| [Cuenta, edición y contraseña](04-identity/02-user-account.md) | CU-IDA-06/07/08 | `DIA-VUE-SEQ-006` |
| [Selección dependiente y escritura de inventario](05-warehouse/01-inventory-selection-write.md) | CU-ALM-02/03/05/10/11/12/13/18/19/21 | `DIA-VUE-SEQ-007` |
| [Merma: respuesta incierta y reintento](05-warehouse/02-waste-pending.md) | CU-ALM-10/13; RF-VUE-007/008 | `DIA-VUE-SEQ-008` |
| [Merma duplicada: apertura de una entrada](05-warehouse/03-waste-duplicate.md) | CU-ALM-10 A2 y CU-ALM-13 | `DIA-VUE-SEQ-009` |
| [Búsqueda, paginación y selección remota](02-shared-runtime/03-remote-lookup.md) | RD-VUE-006; RN-VUE-003/005; soporte de captura | `DIA-VUE-SEQ-010` |
| [Compra: lectura y preparación de partidas](06-purchases/01-purchase-read-lines.md) | CU-ENT-01/02/03/07/08/09 | `DIA-VUE-SEQ-011` |
| [Compra: alta y edición confirmadas](06-purchases/02-purchase-save.md) | CU-ENT-02/03/08/09 | `DIA-VUE-SEQ-012` |
| [Compra: corrección de un detalle](06-purchases/03-purchase-correction.md) | CU-ENT-04/10 | `DIA-VUE-SEQ-013` |
| [Compra: cancelación y reintento explícito](06-purchases/04-purchase-cancel.md) | CU-ENT-05/11 | `DIA-VUE-SEQ-014` |
| [Salida: apertura, modos y escritura](07-issues/01-issue-open-save.md) | CU-SAL-02/03/04/09/10/11/16/17/18 | `DIA-VUE-SEQ-015` |
| [Salida: selección y surtido](07-issues/02-issue-supply.md) | CU-SAL-05/12/19 | `DIA-VUE-SEQ-016` |
| [Salida: devolución por saldo leído](07-issues/03-issue-return.md) | CU-SAL-06/13/20 | `DIA-VUE-SEQ-017/032` |
| [Reportes: alcance, archivo y error recuperable](08-movements-and-reports/02-reports.md) | CU de reporte de cada familia; RF-VUE-013 | `DIA-VUE-SEQ-018` |
| [Recarga visible sin solapamiento](02-shared-runtime/04-visible-refresh.md) | RN-VUE-003/005; consultas de CU-ALM y listados | `DIA-VUE-SEQ-019` |
| [Cierre de sesión y acceso posterior](01-session/03-logout.md) | CU-AUT-02 | `DIA-VUE-SEQ-020` |
| [Baja de relación de inventario](05-warehouse/04-inventory-removal.md) | CU-ALM-04/14/20 | `DIA-VUE-SEQ-021` |
| [Directorio: alta y edición](03-catalogs-and-directory/02-directory-save.md) | CU-CAT-02/03/06/07 | `DIA-VUE-SEQ-022` |
| [Filtros de movimientos](08-movements-and-reports/01-movement-filters.md) | CU-ALM-07/15/23 | `DIA-VUE-SEQ-023` |
| [Actividad de vista previa de merma](05-warehouse/05-waste-preview.md) | CU-ALM-10 | `DIA-VUE-ACT-001` |
| [Renovación concurrente compartida](01-session/04-concurrent-renewal.md) | CU-AUT-01 y consultas autenticadas | `DIA-VUE-SEQ-024` |
| [Lectura, sustitución y reintento](02-shared-runtime/05-document-read.md) | Aperturas CU-ENT y CU-SAL | `DIA-VUE-SEQ-025` |
| [Área autorizada: selección y bloqueo](07-issues/04-department-scope.md) | Consulta/alta CU-SAL y alcance operativo | `DIA-VUE-SEQ-026` |
| [Salida: validación, payload y confirmación](07-issues/01-issue-open-save.md#escritura-de-creación-edición-y-encabezado) | CU-SAL de alta/edición/encabezado | `DIA-VUE-SEQ-027` |
| [Continuación tras renovación](01-session/04-concurrent-renewal.md#continuación-de-cada-petición-original) | CU-AUT-01 y consultas autenticadas | `DIA-VUE-SEQ-028` |
| [Lectura sustituida](02-shared-runtime/05-document-read.md#lectura-sustituida-y-recuperación) | Aperturas CU-ENT y CU-SAL | `DIA-VUE-SEQ-029` |
| [Adaptación visual del área](07-issues/04-department-scope.md#adaptación-de-captura-y-filtros) | Consulta/alta CU-SAL | `DIA-VUE-SEQ-030` |
| [Compra: envío y confirmación](06-purchases/02-purchase-save.md#envío-y-resultado-de-la-operación) | CU-ENT de alta/edición | `DIA-VUE-SEQ-031` |
| [Transformación de datos tipados](02-shared-runtime/06-typed-data-flow.md) | Lectura y escritura del cliente; ejemplo de Compra | `DIA-VUE-FLU-001/002` |

## Figuras complementarias

Los [estados de documento/captura](../logical/document-states.md) explican modos y
transiciones. Los [componentes](../logical/components/index.md) explican responsabilidades.
Los diagramas de [alta contextual](../development/design-and-construction-patterns/09-contextual-creation.md)
representan por separado proveedor en inventario, proveedor/artículo en compra y
cliente en salida. La [composición de patrones](../development/design-and-construction-patterns/index.md)
conserva modelos generales y aplicaciones específicas sin otra copia editable.
