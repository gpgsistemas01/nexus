# CP-VUE-CAT-002-01 — conflicto de versión en un catálogo

## Diseño y trazabilidad

`RF-CAT-024`, `CU-CAT-14`; riesgo de sobrescribir una captura antigua, `DP-VUE-CAT-002`. Transición edición → 409 → lectura nueva → edición.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-CAT-002-01` | `mockCatalogs`, catálogo Roles y registro de fixture con `version=7`; permisos de administración simulados. | Primera captura `Mi captura`; servidor simulado cambia el nombre y versión a 8 y responde `RECORD_VERSION_CONFLICT`. Segunda captura `Segunda captura`. | Editar/enviar; cerrar mediante Cerrar y actualizar catálogo; abrir otra edición y enviar. | La primera solicitud conserva `expectedVersion=7`. El rechazo conserva el texto y deshabilita Actualizar; no hay reenvío automático. La lectura muestra el registro actualizado; la siguiente solicitud usa versión 8 y se confirma. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts), `catálogos: conflicto conserva captura, impide reenvío y exige nueva lectura`. Estado en memoria del harness nuevo por test. No comprueba UPDATE condicionado ni persistencia real.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
