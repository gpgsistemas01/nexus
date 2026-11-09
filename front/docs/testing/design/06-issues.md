# Diseño de pruebas: Salidas

## Salidas de Materiales, Consumibles y Mermas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-ISS-001` | RF-VUE-010 y RD-VUE-007; estados de salida | Unitario y navegador; particiones por recurso y permiso | Rutas Vue y menú protegido, API de cada recurso, rechazo de tipos cruzados y éxito de otro recurso. Una cantidad surtida `null` de Materiales/Consumibles se adapta a cero; ausentes, negativos o texto inválido se rechazan. Mermas exige un número. Sin permiso no accede ni muestra surtido. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-002` | RF-VUE-010; estados de salida | Unitario y navegador; transición pendiente → surtido → devolución y fronteras de cantidad | Pendiente permite detalles; después sólo encabezado. Surtido exige selección, cantidad de entrega positiva dentro del pendiente y proyecto. Entregas de 0.5, 0.5 y 1 completan un detalle de 2; proyecto 250 conserva diferencia negativa y cada envío lleva el acumulado leído. Devolución bloquea mayor al saldo leído, permite saldo exacto y conserva captura tras rechazo. | [CP-VUE-ISS-002-01](../cases/cp-vue-iss-002-01.md); [CP-VUE-ISS-002-02](../cases/cp-vue-iss-002-02.md); [CP-VUE-ISS-002-03](../cases/cp-vue-iss-002-03.md) |
| `DP-VUE-ISS-003` | RF-VUE-010 y CA-RF-ISS-004-1; captura y agrupación | Unitario y navegador; decisiones de payload y selección | Agregar el mismo par material/proveedor suma cantidades y conversión sin mutar el detalle anterior; otro proveedor conserva una fila distinta. El surtido envía sólo los IDs pendientes seleccionados; desmarcar limpia Cantidad de proyecto. Las escrituras no envían saldos derivados. Abrir/mover foco no valida sin captura. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-004` | RF-VUE-010; estados de salida | Unitario y navegador; filtros aplicados, fronteras de captura, exportación y escritorio/móvil | Excel conserva filtros sin paginación. Cliente/área limpian dependencias y conservan filtros operativos de personas y proyecto interno. Proyecto admite hasta 10 caracteres y observaciones hasta 500. Presentación se consulta y limpia al agregar; el alta de cliente se ofrece sólo dentro del selector. Columnas agrupadas y cantidades visibles según alta/surtido/devolución; Área del listado sólo para Almacén/Sistemas. Las acciones operativas preceden a consulta y el modal conserva sus acciones en móvil. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-005` | RF-VUE-010; selector de área fuera del alcance del usuario o precarga que altera una edición | Unitario y navegador; particiones cero/una/varias áreas, página parcial y búsqueda; transiciones error/reintento y cancelación | Consulta `context=issues`. Una única opción disponible en respuesta completa sin búsqueda precarga y bloquea el área; varias áreas o un resultado de búsqueda conservan la selección. La edición no cambia área/solicitante/proyecto. Limpiar filtros mantiene el área obligatoria; el payload conserva su ID. El servidor verifica por separado el acceso ante manipulación. | [CP-VUE-ISS-005-01](../cases/cp-vue-iss-005-01.md); [issueDepartmentsTest.ts](../../../tests/unit/modules/issues/issueDepartmentsTest.ts); [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [manualProfilesTest.ts](../../../tests/unit/tooling/manualProfilesTest.ts) |

La cobertura de cliente vive en `tests/unit/modules/issues/issueTest.ts` y
`tests/e2e/issues.spec.ts`. Reutiliza fixtures y el transporte de prueba existentes;
los dobles HTTP no demuestran persistencia. El backend mantiene las integraciones
de salidas, devoluciones y concurrencia con base aislada.

`DP-VUE-ISS-002` incluye las partidas canceladas: editar no ofrece eliminarlas en
ninguno de los tres recursos. El composable conserva partidas canceladas y ya
surtidas incluso ante una llamada directa a quitar; retirar una pendiente
conserva el historial y el documento original.

## Entregas históricas

| Diseño | Requisito / riesgo | Nivel y técnica | Condición observable | Casos |
| --- | --- | --- | --- | --- |
| `DP-VUE-ISS-006` | `RF-VUE-010`, `RF-ISS-009`: duplicación por desconexión o declarar una entrega sin revisión | Unitario/transporte y Chromium; decisiones de permiso/declaración y transición selección → confirmación incierta → recarga → recibo | Pendientes y parcialmente surtidas cargan automáticamente con hora actual como corte, sin captura de fecha ni filtro de folio/proyecto. Hasta 100 seleccionadas con revisión original; la casilla global única del encabezado carga todas las páginas y conserva selección al navegar. Más de 100 requiere selección manual de hasta 100. Filas alternables individualmente. Declaración obligatoria; sin permiso no hay acción. Reintento conserva comando/clave y recupera recibo. Procedencia visible y devolución histórica exige entrada física actual. | [CP-VUE-ISS-006-01](../cases/cp-vue-iss-006-01.md) |
