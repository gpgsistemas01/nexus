# CP-VUE-WH-002-01 — rechazo de edición con versión original

## Diseño y trazabilidad

DP-VUE-WH-002; CU-ALM-03; RD-VUE-002. Transición edición → conflicto → intento de reenvío.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-WH-002-01` | Vitest/jsdom, editor de material abierto en edición y servicio simulado que devuelve conflicto. | Fila con version=3; captura del escenario un conflicto no cambia la versión ni reenvía automáticamente la escritura. | 1. Cambiar la captura. 2. Enviar y recibir RECORD_VERSION_CONFLICT. 3. Intentar enviar de nuevo desde la misma instancia. | El único payload conserva expectedVersion=3. Se presenta conflicto y no se reenvía automáticamente ni se adopta una versión nueva para aceptar la captura antigua. | Desmontar harness y restaurar espías y Storage conforme a hooks del archivo. |

## Fuente ejecutable y alcance

[inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts), un conflicto no cambia la versión ni reenvía automáticamente la escritura. El UPDATE condicionado requiere servidor real.
