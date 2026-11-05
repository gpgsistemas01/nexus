# CP-VUE-ISS-005-01 — área automática y bloqueada en Salidas

## Diseño y trazabilidad

`RF-VUE-010`, `RF-ISS-004/005`, `RF-WST-002/004`, `CU-SAL-02/03/09/10/16/17`;
`DP-VUE-ISS-005`. Particiones de alcance autorizado y precarga; conservación de
captura en edición, limpieza y recuperación.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-ISS-005-01` | Vue/Vuetify en Chromium con mockIssues independiente; permisos de solicitud. Catálogo autorizado de áreas con respuesta completa y sin búsqueda. Unitarias usan mountComposable y el servicio simulado. | Navegador: única área SISTEMAS, Ana Pérez, Cliente Central, cantidad 2; variantes Materiales/Lona, Consumibles/Lona y Mermas/Sobrante de lona. Alternativa: SISTEMAS/ROUTER. Unitarias: IMPRESIÓN y ROUTER; vacío, opción inactiva, página con una fila/total 2, búsqueda con una coincidencia, error inicial y respuesta cancelada. Edición con proyecto CAP-77. | 1. Abrir Nueva salida en los tres recursos. 2. Comprobar Área y disponibilidad de Solicitante sin seleccionar el área manualmente. 3. Completar encabezado y detalle y guardar. 4. Aplicar un filtro opcional y limpiar filtros. 5. Con dos áreas autorizadas, buscar ROUT y seleccionar ROUTER. 6. En unitarias comprobar edición, página parcial, error/reintento y cierre antes de responder. | Con una sola área, el campo muestra el nombre y está deshabilitado; Solicitante se habilita y se filtra por esa área. Guardar envía el departmentId aun estando bloqueado. Limpiar conserva el área y elimina filtros opcionales. Varias áreas permiten elegir; una búsqueda con un resultado no bloquea. Vacío, inactiva o página parcial no precargan. Editar conserva el área, solicitante y proyecto originales. Un error permite reintentar; una respuesta cancelada no cambia la instancia anterior. | Desmontar harnesses, restaurar mocks/timers y cerrar el contexto Playwright; no usa PostgreSQL ni registros reales. |

## Fuente ejecutable y alcance

[issueDepartmentsTest.ts](../../../tests/unit/modules/issues/issueDepartmentsTest.ts)
comprueba valores, dependencias y estados de carga. [issues.spec.ts](../../../tests/e2e/issues.spec.ts)
comprueba controles reales de Vuetify y el payload de los tres recursos. La API
simulada no acredita autorización del servidor; ese contrato conserva sus pruebas
HTTP/Prisma independientes.

## Ejecución

Registrar comando, revisión, ambiente, fecha, resultado y evidencia como EP conforme
al [plan](../01-test-plan.md). Esta ficha conserva el resultado esperado.
