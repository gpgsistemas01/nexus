# 5. Movimientos

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `movements`. El [corte de componentes](../../logical/components/05-movements.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `MovementPage` | Recurso, permisos, consulta, filtros y reporte. |
| `useMovementFilters` | Proveedor/artículo y fechas con dependencias/limpieza. |
| `movementService` | Identidad del recurso, query, normalización de movimiento y exportación. |
| `MovementTable` | Diez columnas, signos, cero y saldos nulos como datos recibidos. |
| Composables compartidos | Query, selección, paginación, cancelación y alcance de reporte. |

## Datos y operaciones

| Elemento | Contrato |
| --- | --- |
| Recursos | Historial separado de Materiales, Consumibles y Mermas. |
| Filtros | Fechas, proveedor, artículo y búsqueda según recurso; selección dependiente no mezcla identidades. |
| Identidad | Material usa su ID de material; Merma usa su propio ID. |
| Operación | Sólo consulta/reporte; no se capturan movimientos desde esta pantalla. |
| Archivo | Filtros aplicados o alcance mensual admitido, sin paginación. |
| Tabla | Fecha/folio/tipo/referencia/cantidades y saldos; texto y valores históricos no se recalculan como autoridad. |

La [matriz de captura, eventos y recuperación](08-form-and-event-contracts.md) precisa los campos editables y los resultados de interacción.

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Consulta paginada | [Consulta paginada](../../processes/02-shared-runtime/01-list-and-record-save.md) |
| Selección remota | [Selección remota](../../processes/08-movements-and-reports/01-movement-filters.md) |
| Alcance y descarga | [Alcance y descarga](../../processes/08-movements-and-reports/02-reports.md) |

## Evidencia

movementServiceTest.ts, movementFiltersTest.ts y movements.spec.ts. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
