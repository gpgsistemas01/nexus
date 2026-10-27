# CP-VUE-IDA-002-01 — contrato específico de cambio de contraseña

## Diseño y trazabilidad

DP-VUE-IDA-002; CU-IDA-08; RD-VUE-004. Particiones de operación y campos admitidos.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-IDA-002-01` | Vitest/jsdom y editor de cuenta en modo password; accountEntry y servicios simulados. | Contraseña de fixture ClaveNueva2026! y version=7; en la prueba de adaptador, NuevaClave2026! con la misma versión. | 1. Abrir modo de contraseña. 2. Capturar clave y enviar. 3. Ejecutar el caso del adaptador PATCH específico. | El editor envía sólo password y expectedVersion=7, sin consultar opciones organizacionales. El adaptador utiliza PATCH y endpoint específico de contraseña; no modifica vinculación de persona. | Desmontar wrapper y restaurar espías/adaptador. |

## Fuente ejecutable y alcance

[identityTest.ts](../../../tests/unit/modules/identity/identityTest.ts), cambiar contraseña sólo envía la clave y la versión, sin consultar opciones organizacionales; las mutaciones de contraseña usan PATCH y su endpoint específico. No demuestra hashing o actualización SQL.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
