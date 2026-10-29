# Diseño de pruebas: Salidas

## Salidas de Materiales, Consumibles y Mermas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-ISS-001` | RF-VUE-010; estados de salida | Unitario y navegador; particiones por recurso y permiso | Rutas Vue y menú protegido, API de cada recurso, rechazo de tipos cruzados y éxito de otro recurso. Sin permiso no accede ni muestra surtido. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-002` | RF-VUE-010; estados de salida | Unitario y navegador; transición pendiente → surtido → devolución y fronteras de cantidad | Pendiente permite detalles; después sólo encabezado. Surtido exige selección y cantidad de proyecto. Devolución bloquea mayor al saldo leído, permite saldo exacto y conserva captura tras rechazo. | [CP-VUE-ISS-002-01](../cases/cp-vue-iss-002-01.md); [CP-VUE-ISS-002-02](../cases/cp-vue-iss-002-02.md); [CP-VUE-ISS-002-03](../cases/cp-vue-iss-002-03.md) |
| `DP-VUE-ISS-003` | RF-VUE-010; estados de salida | Unitario y navegador; decisiones de payload y selección | El alta distingue proveedor/material y agrupa sólo el mismo par. El surtido envía IDs de detalle; las escrituras no envían saldos derivados. Abrir/mover foco no valida sin captura. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-004` | RF-VUE-010; estados de salida | Unitario y navegador; filtros aplicados, exportación y escritorio/móvil | Excel conserva filtros sin paginación. Cliente/área limpian dependencias y conservan filtros operativos de personas y proyecto interno. El modal mantiene sus acciones en móvil. | [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [issues.spec.ts](../../../tests/e2e/issues.spec.ts) |
| `DP-VUE-ISS-005` | RF-VUE-010; selector de área fuera del alcance del usuario o precarga que altera una edición | Unitario y navegador; particiones cero/una/varias áreas, página parcial y búsqueda; transiciones error/reintento y cancelación | Consulta `context=issues`. Una única opción disponible en respuesta completa sin búsqueda precarga y bloquea el área; varias áreas o un resultado de búsqueda conservan la selección. La edición no cambia área/solicitante/proyecto. Limpiar filtros mantiene el área obligatoria; el payload conserva su ID. El servidor verifica por separado el acceso ante manipulación. | [CP-VUE-ISS-005-01](../cases/cp-vue-iss-005-01.md); [issueDepartmentsTest.ts](../../../tests/unit/modules/issues/issueDepartmentsTest.ts); [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [manualProfilesTest.ts](../../../tests/unit/tooling/manualProfilesTest.ts) |

La cobertura de cliente vive en `tests/unit/modules/issues/issueTest.ts` y
`tests/e2e/issues.spec.ts`. Reutiliza fixtures y el transporte de prueba existentes;
los dobles HTTP no demuestran persistencia. El backend mantiene las integraciones
de salidas, devoluciones y concurrencia con base aislada.
