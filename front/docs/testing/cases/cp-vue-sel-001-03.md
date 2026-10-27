# CP-VUE-SEL-001-03 — cliente desde una salida

## Diseño y trazabilidad

`CU-CAT-06`, soporte de las capturas de Salidas; `DP-VUE-SEL-001`. Mismo contrato parametrizado en Materiales, Consumibles y Mermas.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SEL-001-03` | Chromium con mockIssues nuevo por recurso; permisos de consulta/alta de clientes y gestión de salida. | Observaciones Salida sin guardar; búsqueda Cliente nuevo materiales/consumibles/mermas; respuesta con ID y versión de fixture. | Buscar en Cliente, elegir Registrar cliente, comprobar nombre precargado y Guardar. | El auxiliar se cierra después de confirmar el alta. El selector muestra el cliente de respuesta; las observaciones del origen permanecen y no hay solicitud de guardar la salida. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[selectCreation.spec.ts](../../../tests/e2e/selectCreation.spec.ts), `select salidas materiales: cliente nuevo precargado y elegido sin guardar la salida` y variantes `consumibles`/`mermas`. Aislamiento Playwright; API simulada. Los casos adicionales del archivo comprueban teclado, permisos y consumidores sin alta.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
