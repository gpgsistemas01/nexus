# CP-VUE-ISS-002-02 — devolución por la interfaz

## Diseño y trazabilidad

`RF-ISS-003` / `RF-WST-006`, `RN-014`, `CU-SAL-06` / `CU-SAL-20` / `CU-SAL-13`; `DP-VUE-ISS-002`. Frontera superior de cantidad sobre saldo leído.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-ISS-002-02` | Dentro del test independiente de salidas, su preparación ya surtió el detalle y actualizó encabezado. No requiere ejecutar CP-VUE-ISS-002-01. | Detalle surtido: entregado 2, devuelto 0; devoluciones intentadas 3 y 1. Dos escrituras previas del propio recorrido. | Abrir devolución; enviar 3; corregir a 1 y enviar. | Abrir no muestra errores. Con 3 el contador permanece en dos solicitudes; con 1 se envía a `/returns` `{ returnQuantity: 1, observations: '' }` y se cierra el diálogo. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[issues.spec.ts](../../../tests/e2e/issues.spec.ts), tramo de devolución del mismo recorrido. Aislamiento Playwright. El incremento del stock y la transacción requieren backend real.
