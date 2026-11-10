# CP-VUE-ISS-002-01 — surtir un detalle seleccionado

## Diseño y trazabilidad

`RF-ISS-002` / `RF-WST-003`, `CU-SAL-05` / `CU-SAL-19` / `CU-SAL-12`; `DP-VUE-ISS-002`. Selección pendiente, cantidades vacías/fuera de saldo y transición de entrega parcial a completa.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-ISS-002-01` | Chromium con mockIssues nuevo por recurso, detalle solicitado de 2 y permiso de surtido. | Completo: entrega 2 y proyecto 180. Parcial: entregas 0.5, 0.5 y 1, proyecto total 250 y conversión 200; estado de salida parcial con detalle completo. | Seleccionar el detalle; enviar con cantidad vacía o mayor que 2; corregir y surtir. En el recorrido parcial, reabrir el surtido para cada entrega restante. Abrir el surtido en estado parcial con un detalle completamente surtido. | No escribe con cantidad inválida. Cada envío contiene ID, selección, `quantityToSupply`, acumulado leído en `expectedSuppliedQuantity` y proyecto. Las primeras entregas conservan Surtido parcial; la última completa 2. Proyecto permanece en 250 y diferencia en −50; los acumulados esperados son 0, 0.5 y 1. Un detalle completamente surtido muestra su estado en lugar del input de cantidad. | Contexto Playwright descartado; sin escrituras SQL. |

## Fuente ejecutable y alcance

[issues.spec.ts](../../../tests/e2e/issues.spec.ts), tramo de surtido de `salidas materiales: edición pendiente, surtido y devolución` , `salidas consumibles: edición pendiente, surtido y devolución` y `salidas mermas: edición pendiente, surtido y devolución`. Aislamiento Playwright. No demuestra descuento real ni falta de stock.
