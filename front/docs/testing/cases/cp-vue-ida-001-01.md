# CP-VUE-IDA-001-01 — editar responsabilidades sin duplicar área

## Diseño y trazabilidad

DP-VUE-IDA-001; CU-IDA-03; RD-VUE-002. Decisiones por área duplicada y conservación de la versión.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-IDA-001-01` | Vitest/jsdom, usePersonEditor editando personEntry, organizationService e identityService simulados. | personEntry con dos responsabilidades y version=4; segunda asignación al área recordIds.department con recordIds.secondRole; nombre " Ana Actualizada ". | 1. Esperar opciones. 2. Intentar agregar la segunda asignación en la misma área. 3. Cambiar el nombre y guardar. | Error ya está y dos asignaciones intactas. Guardado contiene fullName=Ana Actualizada, expectedVersion=4 y sólo departmentId/roleId de cada responsabilidad; sin etiquetas ni datos de cuenta. | Desmontaje del harness y restauración de espías/adaptador en hooks. |

## Fuente ejecutable y alcance

[identityTest.ts](../../../tests/unit/modules/identity/identityTest.ts), agregar rechaza área duplicada y editar conserva las otras responsabilidades y la versión original. Servicio simulado: no acredita persistencia.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
