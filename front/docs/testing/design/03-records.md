# Diseño de pruebas: Catálogos, identidad y directorio

La [guía de diseño](../02-test-design.md) define las tablas DP y sus relaciones con los casos. Esta ficha agrupa condiciones del mismo dominio o contrato.

## Pruebas de Catálogos

El plan y registro general del backend siguen siendo propietarios de las pruebas
HTTP/Prisma. Estas pruebas Vue usan adaptadores Axios y API simulada en Chromium;
no ejecutan Express ni acceden a la base de datos de desarrollo.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-CAT-001` | RF-VUE-005; administración de catálogos | Unitario y navegador; particiones de permiso/ruta y transiciones de sesión | Las seis rutas requieren catalogs:manage. Una cuenta exclusiva llega a Áreas. Sin permiso no consulta la API administrativa; catálogo desconocido es 404. Revocar acceso durante una escritura termina en login o acceso denegado. | [catalogEditorTest.ts](../../../tests/unit/modules/catalogs/catalogEditorTest.ts); [catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts) |
| `DP-VUE-CAT-002` | RF-VUE-005; administración de catálogos | Unitario y navegador; fronteras vacío/máximo/máximo+1 y decisiones por campo/estado | Alta de los seis catálogos con campos permitidos, símbolo sólo en unidades y estado inactivo. Abrir/mover foco no muestra errores. PUT conserva expectedVersion; 409 conserva captura y bloquea reenvío hasta nueva lectura. No se solapan envíos ni se confirman tras desmontar. | [CP-VUE-CAT-002-01](../cases/cp-vue-cat-002-01.md) |
| `DP-VUE-CAT-003` | RF-VUE-005; administración de catálogos | Navegador; error → reintento → página → búsqueda → limpiar, escritorio/móvil | Búsqueda reinicia paginación, la API recibe start/length/search y un fallo permite recuperar el listado. El modal es utilizable a 390/320 px. El menú agrupa los seis enlaces y conserva apertura por clic y cierre fuera. | [catalogEditorTest.ts](../../../tests/unit/modules/catalogs/catalogEditorTest.ts); [catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts) |
| `DP-VUE-CAT-004` | RF-VUE-005; administración de catálogos | Adaptador unitario; particiones de respuesta válida/HTML/incompleta/código inesperado | El frontend rechaza contratos incompletos, omite claves internas y no confirma códigos inesperados. Los recorridos de Almacén comprueban los marcos de tabla/modal compartidos. | [catalogServiceTest.ts](../../../tests/unit/modules/catalogs/catalogServiceTest.ts); [catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts) |

`catalogEditorTest.ts`, `catalogServiceTest.ts`, `inventoryNavigationTest.ts` y
`catalogs.spec.ts` son la especificación ejecutable. Las suites de Almacén siguen
cubriendo cabeceras agrupadas, modales, selección, filtros, versiones y recuperación
de merma; no se sustituye esa evidencia por la del formulario de Catálogos.

Los iconos del menú se importan desde `@mdi/js` en `app/icons.ts` y se renderizan
con el proveedor SVG de Vuetify. Al incorporar esta actualización se ejecuta
`npm ci --include=dev` en `front/`; no se carga una fuente de iconos por CDN.
ESLint excluye `test-results/`, una salida temporal regenerada por Playwright.


## Pruebas de Identidad y Directorio comercial

Los requisitos y operaciones siguen en `CU-IDA-01..09` y `CU-CAT-01..08`;
esta adaptación añade evidencia de interfaz, no reemplaza las pruebas de servidor.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-IDA-001` | RF-VUE-005; persona/cuenta y responsabilidades | Unitario/navegador; captura vacía/válida, asignación única/duplicada y edición/remoción | Abrir no muestra errores; guardar requiere nombre y responsabilidades. Una segunda asignación de la misma área se rechaza; editar conserva las demás áreas y la versión original. Payload sin etiquetas ni datos de cuenta. | [CP-VUE-IDA-001-01](../cases/cp-vue-ida-001-01.md) |
| `DP-VUE-IDA-002` | RF-VUE-005; persona/cuenta y responsabilidades | Unitario/navegador; modos alta/edición/contraseña y estados pendiente/conflicto/revocación | Alta envía clave válida; editar omite clave y personId; cambiar contraseña usa PATCH con clave/expectedVersion. No se repiten envíos pendientes ni versiones en conflicto; 401/403 abandona acceso protegido. | [CP-VUE-IDA-002-01](../cases/cp-vue-ida-002-01.md) |
| `DP-VUE-DIR-001` | RF-VUE-005; directorio | Unitario/navegador; recursos Clientes/Proveedores, fronteras máximas de nombre y estados activo/inactivo | Cada recurso envía sólo sus campos. Alta y edición usan sus permisos y métodos; conflicto conserva captura, recarga exige otra versión; red fallida requiere reintento y desmontar descarta confirmaciones tardías. | [directoryTest.ts](../../../tests/unit/modules/directory/directoryTest.ts); [records.spec.ts](../../../tests/e2e/records.spec.ts) |
| `DP-VUE-REC-001` | Unitario/navegador | Unitario; particiones por permiso y entrada exclusiva de módulo | Cada ruta/directorio se permite o rechaza por su permiso; las entradas de grupo y login resuelven al primer enlace autorizado. Sólo lectura oculta escritura/exportación; el menú usa rutas Vue. | [recordNavigationTest.ts](../../../tests/unit/modules/identity/recordNavigationTest.ts); [records.spec.ts](../../../tests/e2e/records.spec.ts) |
| `DP-VUE-REC-002` | Adaptador/navegador | Unitario; filtros y archivo válido/HTML, escritorio/móvil | Consultas usan paginación/orden y Personas incluye responsabilidades. Reporte por área descarga Excel; filtro de rol no admitido se bloquea antes de solicitar archivo. Formularios a 320 px conservan acciones visibles y no desbordan la página. | [recordNavigationTest.ts](../../../tests/unit/modules/identity/recordNavigationTest.ts); [records.spec.ts](../../../tests/e2e/records.spec.ts) |

`identityTest.ts`, `recordNavigationTest.ts`, `directoryTest.ts` y `records.spec.ts`
son la especificación ejecutable. Reutilizan fixtures de registros, el adaptador
Axios y las opciones/recorridos de navegador existentes. `RemoteSelect`,
`useSelectedOption` y `useRemoteLookup` se prueban también desde Almacén tras moverlos
a `shared`; `inventoryReportTest.ts` conserva la validación de Excel y filtros.
La API simulada no demuestra cambios persistidos, contenido de reportes de servidor
ni políticas reales de autorización. No se usan datos ni una base de desarrollo.
