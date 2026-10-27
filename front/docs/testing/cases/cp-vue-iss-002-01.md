# CP-VUE-ISS-002-01 — surtir un detalle seleccionado

## Diseño y trazabilidad

`RF-ISS-002` / `RF-WST-003`, `CU-SAL-05` / `CU-SAL-19` / `CU-SAL-12`; `DP-VUE-ISS-002`. Selección pendiente y cantidad de proyecto ausente/válida.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-ISS-002-01` | Chromium con mockIssues nuevo para cada recurso; salida aprobada pendiente con un detalle y permiso de surtido. | Cantidad del detalle 2; proyecto 180. Variantes Materiales/Lona, Consumibles/Lona y Mermas/Sobrante de lona. | Abrir Surtir detalle; seleccionar el detalle; enviar sin cantidad de proyecto; capturar 180 y reenviar. | Encabezado bloqueado. El primer intento no genera escritura. El segundo envía sólo `details: [{ id: issueDetailId, isSupplied: true, projectConvertedQuantity: 180 }]` a `/details`; se cierra el diálogo. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[issues.spec.ts](../../../tests/e2e/issues.spec.ts), tramo de surtido de `salidas materiales: edición pendiente, surtido y devolución` , `salidas consumibles: edición pendiente, surtido y devolución` y `salidas mermas: edición pendiente, surtido y devolución`. Aislamiento Playwright. No demuestra descuento real ni falta de stock.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
