# 6. Compras

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `purchases`. El [corte de componentes](../../logical/components/06-purchases.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `PurchaseWorkspace` | Proveedor/artículo auxiliares sin imports privados entre módulos. |
| `PurchasePage` / `usePurchaseActions` | Listado, lectura, modos, corrección/cancelación y recarga. |
| `usePurchaseEditor` | Encabezado, borrador, selección de proveedor y validación de documento. |
| `usePurchaseLineEntry` | Selección/cantidad/costo de una partida transitoria; emite add. |
| `usePurchaseCorrection` | Captura, preview y confirmación de corrección. |
| Reglas, cálculos y mappers | Modo permitido, vista previa y campos de request/response. |
| `purchaseService` | Rutas fijas por contexto, normalización y códigos confirmados. |

## Datos y operaciones

| Operación | Contrato |
| --- | --- |
| Recurso | materials/consumables; no mezclar detalles entre contextos. |
| Alta | Proveedor, receptor, fecha, factura si aplica, observaciones y al menos una partida válida. |
| Partida | Artículo del proveedor, cantidad y costo; Agregar sólo cambia borrador. |
| Edición | Proveedor fijo, encabezado admitido y partidas nuevas; detalles persistidos no se reescriben. |
| Consulta | Documento/detalles/observaciones; no ofrece guardado general. |
| Corrección | Cantidad/costo cambiados; confirmación y PATCH de detalle específico. |
| Cancelación | Aviso cancelable/reintentable, PATCH /cancel sin payload de corrección. |
| Observaciones | Encabezado editable según modo; historia de ajustes/movimientos conserva registro separado. |
| Totales y stock | Preview del cliente; API valida/persiste e informa resultado. |

La [matriz de captura, eventos y recuperación](08-form-and-event-contracts.md) precisa los campos editables y los resultados de interacción.

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Lectura y partidas | [Lectura y partidas](../../processes/06-purchases/01-purchase-read-lines.md) |
| Alta y edición | [Alta y edición](../../processes/06-purchases/02-purchase-save.md) |
| Corrección | [Corrección](../../processes/06-purchases/03-purchase-correction.md) |
| Cancelación | [Cancelación](../../processes/06-purchases/04-purchase-cancel.md) |
| Alta contextual | [Alta contextual](../../processes/02-shared-runtime/02-documents-and-contextual-creation.md) |
| Reportes | [Reportes](../../processes/08-movements-and-reports/02-reports.md) |

Los [estados de captura y documento](../../logical/document-states.md) complementan las secuencias; los [patrones](../design-and-construction-patterns/index.md) conservan modelo general y aplicación específica.

## Evidencia

purchaseTest.ts, purchaseQuickCreateTest.ts, purchases.spec.ts y selectCreation.spec.ts. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
