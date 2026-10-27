# CP-VUE-WH-011-02 — trasladar un duplicado con cantidad cero

## Diseño y trazabilidad

`CU-ALM-10` A2, `CU-ALM-13`, `DP-VUE-WH-011`. Frontera cero/positivo del campo de entrada.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-WH-011-02` | Chromium con mockWarehouse nuevo, permiso de entrada y duplicado definitivo. No depende de la variante positiva. | Misma plantilla/pesos del escenario de duplicado; cantidad inicial 0, observaciones Conservar esta captura y posterior entrada 4. | Guardar, cancelar y confirmar un nuevo intento; en Agregar stock enviar vacío; capturar 4 y Guardar. | La transición conserva las observaciones y deja cantidad vacía, sin errores al abrir. El envío vacío no genera entrada; con 4 se envía una sola entrada, con su propio `operationId`. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts), `mermas: duplicado traslada cantidad 0 y observaciones sólo después de confirmar`. Contexto aislado de navegador con API simulada; no hay limpieza SQL.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
