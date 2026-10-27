# CP-VUE-REC-003-01 — reportes por recurso con recuperación

## Diseño y trazabilidad

`CU-IDA-09`, `CU-CAT-08/04`, `DP-VUE-REC-003`. Misma condición parametrizada por reporte y transición 503 → reintento.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-REC-003-01` | Chromium con mockRecords nuevo por recurso; permiso de exportación. Primer reporte falla y el segundo devuelve un blob XLSX de fixture. | Usuarios: búsqueda ana. Clientes/Proveedores: Central. Primer reporte 503; siguiente blob con MIME XLSX. | Abrir módulo, aplicar búsqueda, exportar, observar error y volver a pulsar Exportar Excel. | El fallo muestra Error de descarga y rehabilita el botón. El reintento descarga `.xlsx` del endpoint correspondiente, conserva `search` y omite `start`, `length` y `draw`. Se limpia el error; no hay reintento automático. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[records.spec.ts](../../../tests/e2e/records.spec.ts), `reportes Usuarios: exporta filtros sin paginación y recupera una descarga fallida` y variantes `Clientes`/`Proveedores`. Aislamiento Playwright; esta ficha no comprueba filas del archivo simulado.

## Ejecución

El resultado real se registra como EP con revisión, ambiente, fecha, comando, estado y evidencia conforme al [plan](../01-test-plan.md). Esta ficha no contiene resultados de corridas.
