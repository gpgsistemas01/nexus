# Procesos y colaboraciones

## Propósito y lectura

Las secuencias explican orden, decisiones y recuperación de colaboradores reales.
Las fichas CU describen el objetivo del actor; esta vista identifica los métodos,
modos, contratos y efectos que lo realizan. Cada figura conserva fuente técnica e
identificador. La API se muestra como frontera externa; el detalle de su transacción
no se atribuye al cliente Vue.

## Infraestructura y coordinación general

1. [Arranque, guarda y renovación](01-bootstrap-and-session.md).
2. [Consulta y guardado compartidos](02-list-and-record-save.md).
3. [Documentos y creación contextual](03-documents-and-contextual-creation.md).

## Secuencias por operación

| Proceso | Casos/contrato | Figura |
| --- | --- | --- |
| [Captura, login y navegación](04-login.md) | CU-AUT-01 | `DIA-VUE-SEQ-003` |
| [Alta y edición de catálogos](05-catalog-record-save.md) | CU-CAT-10/11/13/14/16/17/19/20/22/23/25/26; soporte de Directorio | `DIA-VUE-SEQ-004` |
| [Personas y responsabilidades](06-person-responsibilities.md) | CU-IDA-02/03 | `DIA-VUE-SEQ-005` |
| [Cuenta, edición y contraseña](07-user-account.md) | CU-IDA-06/07/08 | `DIA-VUE-SEQ-006` |
| [Selección dependiente y escritura de inventario](08-inventory-selection-write.md) | CU-ALM-02/03/05/10/11/12/13/18/19/21 | `DIA-VUE-SEQ-007` |
| [Merma: respuesta incierta y reintento](09-waste-pending.md) | CU-ALM-10/13; RF-VUE-007/008 | `DIA-VUE-SEQ-008` |
| [Merma duplicada: apertura de una entrada](10-waste-duplicate.md) | CU-ALM-10 A2 y CU-ALM-13 | `DIA-VUE-SEQ-009` |
| [Búsqueda, paginación y selección remota](11-remote-lookup.md) | RD-VUE-006; RN-VUE-003/005; soporte de captura | `DIA-VUE-SEQ-010` |
| [Compra: lectura y preparación de partidas](12-purchase-read-lines.md) | CU-ENT-01/02/03/07/08/09 | `DIA-VUE-SEQ-011` |
| [Compra: alta y edición confirmadas](13-purchase-save.md) | CU-ENT-02/03/08/09 | `DIA-VUE-SEQ-012` |
| [Compra: corrección de un detalle](14-purchase-correction.md) | CU-ENT-04/10 | `DIA-VUE-SEQ-013` |
| [Compra: cancelación y reintento explícito](15-purchase-cancel.md) | CU-ENT-05/11 | `DIA-VUE-SEQ-014` |
| [Salida: apertura, modos y escritura](16-issue-open-save.md) | CU-SAL-02/03/04/09/10/11/16/17/18 | `DIA-VUE-SEQ-015` |
| [Salida: selección y surtido](17-issue-supply.md) | CU-SAL-05/12/19 | `DIA-VUE-SEQ-016` |
| [Salida: devolución por saldo leído](18-issue-return.md) | CU-SAL-06/13/20 | `DIA-VUE-SEQ-017` |
| [Reportes: alcance, archivo y error recuperable](19-reports.md) | CU de reporte de cada familia; RF-VUE-013 | `DIA-VUE-SEQ-018` |
| [Recarga visible sin solapamiento](20-visible-refresh.md) | RN-VUE-003/005; consultas de CU-ALM y listados | `DIA-VUE-SEQ-019` |
| [Cierre de sesión y acceso posterior](21-logout.md) | CU-AUT-02 | `DIA-VUE-SEQ-020` |
| [Baja de relación de inventario](22-inventory-removal.md) | CU-ALM-04/14/20 | `DIA-VUE-SEQ-021` |
| [Directorio: alta y edición](23-directory-save.md) | CU-CAT-02/03/06/07 | `DIA-VUE-SEQ-022` |
| [Filtros de movimientos](24-movement-filters.md) | CU-ALM-07/15/23 | `DIA-VUE-SEQ-023` |
| [Actividad de vista previa de merma](25-waste-preview.md) | CU-ALM-10 | `DIA-VUE-ACT-001` |

## Figuras complementarias

Los [estados de documento/captura](../logical/document-states.md) explican modos y
transiciones. Los [componentes](../logical/components/index.md) explican responsabilidades.
Los diagramas de [alta contextual](../development/design-and-construction-patterns/09-contextual-creation.md)
representan por separado proveedor en inventario, proveedor/artículo en compra y
cliente en salida. La [composición de patrones](../development/design-and-construction-patterns/index.md)
conserva modelos generales y aplicaciones específicas sin otra copia editable.
