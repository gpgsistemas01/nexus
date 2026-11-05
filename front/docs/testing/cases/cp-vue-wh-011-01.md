# CP-VUE-WH-011-01 — trasladar un duplicado con cantidad positiva

## Diseño y trazabilidad

`CU-ALM-10` A2, `CU-ALM-13`, `DP-VUE-WH-011`. Transición alta rechazada → cancelar → confirmar → entrada revisada.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-WH-011-01` | Chromium con mockWarehouse nuevo, permiso de agregar stock y respuesta de duplicado definitivo con contexto identificado. | Plantilla Lona/ROLLO 2 × 50; referencia 10.25 kg, cono 0.25 kg, sobrante 2.75 kg; initialQuantity=3 y observaciones Conservar esta captura. 409 WASTE_ALREADY_EXISTS con operationRejected=true. | Guardar alta, cancelar el aviso; comprobar captura; volver a guardar y confirmar Abrir Agregar stock. Revisar el nuevo editor y después Guardar. | Cancelar conserva cantidad/observaciones y no registra entrada. Confirmar reemplaza el editor con la identidad recibida y cantidad 3, sin errores iniciales ni escritura automática. Guardar envía una entrada con cantidad 3, observaciones y `operationId` distinto del alta rechazada. No fabrica `expectedVersion`. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts), `mermas: duplicado traslada cantidad 3 y observaciones sólo después de confirmar`. Contexto aislado; APIs simuladas. Unitarias de [recuperación](../../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts) añaden rechazos por permiso, incertidumbre, metadatos y desmontaje. No acredita stock SQL.
