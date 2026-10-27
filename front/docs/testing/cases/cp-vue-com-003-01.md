# CP-VUE-COM-003-01 — confirmar una corrección de compra

## Diseño y trazabilidad

`RF-REC-002`, `CU-ENT-04`; `DP-VUE-COM-003`. Decisiones cancelar/confirmar sobre la misma captura.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-COM-003-01` | Chromium con mockPurchases nuevo; permiso de corrección, compra y detalle activos visibles en consulta. | Compra COM-001, detalle Lona: cantidad 2, costo por presentación 100. Corrección: cantidad 1 y costo 100. | Consultar la compra; abrir Corregir detalle; capturar 1; abrir confirmación y cancelar; volver a confirmar aceptando. | La consulta no ofrece Guardar; la estimación muestra `$116`. Cancelar no genera solicitud ni pierde el diálogo. Confirmar genera una solicitud a `/details/:id/corrections` con `{ quantity: 1, costPerUnitType: 100 }`, conserva la consulta y presenta el mensaje de éxito. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[purchases.spec.ts](../../../tests/e2e/purchases.spec.ts), tramo de corrección de `compras: consulta, corrección y cancelación explícita conservan el historial`. El mismo test contiene aserciones adicionales de cancelación, fuera de esta ficha. Aislamiento Playwright; no verifica stock/historial SQL ni el cálculo persistido.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
