# CP-VUE-ISS-002-03 — precisión y reintento de devolución

## Diseño y trazabilidad

`RN-014`, representante de `CU-SAL-06`; `DP-VUE-ISS-002`. Valores frontera y transición rechazo → reintento → desmontaje.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-ISS-002-03` | Composable montado con servicio de devolución simulado; primer rechazo y siguiente confirmación. | suppliedQuantity=2.12, returnedQuantity=1.1; saldo 1.02. Capturas 1.03 y 1.02. Error simulado Saldo cambió. | Enviar 1.03; enviar 1.02; repetir explícitamente; desmontar e intentar otro envío. | 1.03 no llama al servicio. 1.02 conserva captura y mensaje ante rechazo; el siguiente intento notifica la confirmación. Tras desmontar no hay una tercera llamada. | Desmontar wrapper y restaurar mocks mediante hooks del test. |

## Fuente ejecutable y alcance

[issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts), `devolución limita por el saldo leído, conserva precisión y exige reintento explícito`, con `resource: materials`. Se desmonta el wrapper; los hooks restauran dobles. No es navegador ni persistencia, ni demuestra por sí solo las variantes merma/consumible.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
