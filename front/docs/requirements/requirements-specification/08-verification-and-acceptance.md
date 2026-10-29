# 8. Verificación y aceptación de requisitos

## Alcance de la comprobación

El catálogo de producto conserva 165 obligaciones. La especificación del cliente añade
31 obligaciones: 14 funcionales, 6 de datos, 7 de interacción/construcción y 4 de calidad.
Los criterios de esta sección precisan escenarios de esas obligaciones; no crean otros
objetivos de usuario ni renumeran los 94 casos de uso.

La verificación contrasta una obligación con su evidencia. La aceptación registra si
el resultado satisface la necesidad acordada, quién lo decide y qué pendientes admite.
La existencia de una prueba o una compilación correcta no sustituye esa decisión.

## Criterios de los recorridos críticos del cliente

Los criterios resumidos en la [especificación Vue](client-specification.md) se
complementan con las siguientes condiciones. Los campos y reglas de negocio siguen
en el catálogo y las fichas; las entradas concretas y oráculos de prueba se mantienen
en DP/CP, sin duplicarlos aquí.

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-002-1` | Ante respuestas 401 concurrentes de operaciones protegidas, el cliente coordina una renovación y cada solicitud original se repite como máximo una vez por ese recorrido. Un rechazo del login público no inicia refresh. |
| `CA-RF-VUE-002-2` | Si la renovación es rechazada, se solicita acceso nuevamente conservando un destino interno permitido. Si falla la conexión o el proxy, se ofrece volver a comprobar el acceso; no se interpreta ese fallo como credenciales inválidas. |
| `CA-RF-VUE-003-1` | Almacén conserva las lecturas y altas de Clientes/Proveedores desde selectores autorizados, pero no las páginas independientes. Sistemas dispone del mantenimiento. Ocultar enlaces se acompaña de la comprobación de acceso directo. |
| `CA-RF-VUE-010-1` | Almacén puede consultar y preparar salidas para todas las áreas autorizadas por su acceso. Una cuenta operativa utiliza sólo las suyas: si el catálogo autorizado sin búsqueda contiene una sola área activa, se selecciona y bloquea; una búsqueda que devuelve una coincidencia no convierte un catálogo múltiple en un área obligatoria. |
| `CA-RF-VUE-012-1` | Abrir o cancelar un alta auxiliar no guarda el formulario principal. Guardar correctamente incorpora y selecciona el nuevo registro, conservando la captura de origen. El alta confirmada permanece aunque después se abandone esa captura. |
| `CA-RD-VUE-002-1` | Crear omite la versión de edición. Editar o ajustar envía la versión que abrió la captura; un conflicto conserva los datos y exige consultar la versión vigente antes de preparar otra edición. |
| `CA-RN-VUE-001-1` | Abrir un formulario intacto no muestra errores de captura. Validar un campo modificado o confirmar el formulario muestra los errores aplicables sin perder los valores corregibles. |
| `CA-RN-VUE-007-1` | Un listado no se actualiza automáticamente mientras está oculto, existe una carga incompatible o una captura que su consumidor protege. Cuando vuelve a ser elegible y está vencido, renueva la consulta aplicada conservando sus filtros. |

Una cuenta operativa de Instalaciones utiliza el rol Instalador. Estos criterios no
le conceden surtidos, devoluciones ni ajustes: esas acciones conservan sus permisos
y los actores definidos en los casos de uso. La API vuelve a comprobar área y permiso,
aunque el cliente muestre un campo bloqueado o una acción oculta.

## Trazabilidad de las obligaciones del cliente

Cada ID local tiene una forma de revisión identificada. Una referencia a una suite
señala dónde revisar su cobertura, no que demuestre todos los escenarios del requisito.
Las simulaciones comprueban contratos/interacción; el sistema real comprueba los
representantes que implementa. Las brechas funcionales de cada `CU-*` pertenecen a la
[matriz de cobertura](../../testing/04-use-case-coverage.md).

| Requisito | Evidencia o forma de revisión |
| --- | --- |
| `RF-VUE-001` | [Formulario de login](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts) y [login en navegador](../../../tests/e2e/login.spec.ts). |
| `RF-VUE-002` | [Cliente HTTP](../../../tests/unit/shared/http/apiClientTest.ts), [recuperación de sesión](../../../tests/e2e/sessionRecovery.spec.ts) y [sistema](../../../tests/system/application.spec.ts). |
| `RF-VUE-003` | [Router](../../../tests/unit/app/routerTest.ts), [acceso a páginas](../../../tests/unit/app/pageAccessTest.ts) y [navegación en Salidas](../../../tests/e2e/issues.spec.ts). |
| `RF-VUE-004` | [Interacción de listados](../../../tests/unit/shared/composables/listInteractionTest.ts), [query de tabla](../../../tests/unit/shared/composables/tableQueryTest.ts) y [contrato paginado](../../../tests/unit/shared/http/pageRequestTest.ts). |
| `RF-VUE-005` | [Catálogos](../../../tests/e2e/catalogs.spec.ts) y [Directorio/Identidad](../../../tests/e2e/records.spec.ts). |
| `RF-VUE-006` | [Formulario de inventario](../../../tests/unit/modules/warehouse/inventoryFormTest.ts) y [Almacén](../../../tests/e2e/warehouse.spec.ts). |
| `RF-VUE-007` | [Formulario de inventario](../../../tests/unit/modules/warehouse/inventoryFormTest.ts), [Almacén](../../../tests/e2e/warehouse.spec.ts) y los efectos reales exigidos por los casos de Merma. |
| `RF-VUE-008` | [Recuperación de merma](../../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts) y [Almacén](../../../tests/e2e/warehouse.spec.ts); confirmar idempotencia persistente requiere además la API/base aisladas. |
| `RF-VUE-009` | [Compras unitarias](../../../tests/unit/modules/purchases/purchaseTest.ts) y [Compras en navegador](../../../tests/e2e/purchases.spec.ts). |
| `RF-VUE-010` | [Salidas unitarias](../../../tests/unit/modules/issues/issueTest.ts), [alcance de áreas](../../../tests/unit/modules/issues/issueDepartmentsTest.ts) y [Salidas en navegador](../../../tests/e2e/issues.spec.ts). |
| `RF-VUE-011` | [Servicio de movimientos](../../../tests/unit/modules/movements/movementServiceTest.ts) y [Movimientos en navegador](../../../tests/e2e/movements.spec.ts). |
| `RF-VUE-012` | [Altas desde selectores](../../../tests/e2e/selectCreation.spec.ts) y [alta contextual de artículos](../../../tests/unit/modules/purchases/purchaseQuickCreateTest.ts). |
| `RF-VUE-013` | [Reportes de inventario](../../../tests/unit/modules/warehouse/inventoryReportTest.ts), [alcance de reportes](../../../tests/unit/shared/composables/reportScopeTest.ts) y [XLSX representativos de sistema](../../../tests/system/application.spec.ts). |
| `RF-VUE-014` | [Cierre y acceso posterior](../../../tests/e2e/sessionRecovery.spec.ts) y [sesión real en sistema](../../../tests/system/application.spec.ts). |
| `RD-VUE-001` | [Opciones remotas](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts) y [altas desde selectores](../../../tests/e2e/selectCreation.spec.ts). |
| `RD-VUE-002` | [Editores de catálogo](../../../tests/unit/modules/catalogs/catalogEditorTest.ts), [Directorio](../../../tests/unit/modules/directory/directoryTest.ts) e [Inventario](../../../tests/unit/modules/warehouse/inventoryFormTest.ts). |
| `RD-VUE-003` | [Captura de inventario](../../../tests/unit/modules/warehouse/inventoryFormTest.ts), [Compras](../../../tests/unit/modules/purchases/purchaseTest.ts) y [Salidas](../../../tests/unit/modules/issues/issueTest.ts). |
| `RD-VUE-004` | [Login](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts), [sesión](../../../tests/e2e/sessionRecovery.spec.ts) e inspección de Storage/cookies en el entorno integrado. |
| `RD-VUE-005` | [Mappers de Compras](../../../tests/unit/modules/purchases/purchaseTest.ts) y [Salidas](../../../tests/unit/modules/issues/issueTest.ts); revisar además validación y cálculo definitivo en la API. |
| `RD-VUE-006` | [Selección por ID](../../../tests/unit/shared/composables/selectedOptionTest.ts) y [lookup remoto](../../../tests/unit/shared/composables/remoteLookupTest.ts). |
| `RN-VUE-001` | [Login en navegador](../../../tests/e2e/login.spec.ts), [Almacén](../../../tests/e2e/warehouse.spec.ts) y [registros](../../../tests/e2e/records.spec.ts). |
| `RN-VUE-002` | [Guardado y recuperación de merma](../../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts) y [Compras](../../../tests/unit/modules/purchases/purchaseTest.ts). |
| `RN-VUE-003` | [Lookup remoto](../../../tests/unit/shared/composables/remoteLookupTest.ts), [listado de inventario](../../../tests/unit/modules/warehouse/inventoryListTest.ts) y desmontaje de consumidores. |
| `RN-VUE-004` | [Avisos como texto](../../../tests/unit/shared/ui/feedbackTest.ts), [teclado en selectores](../../../tests/e2e/selectCreation.spec.ts) y móvil en [Salidas](../../../tests/e2e/issues.spec.ts); no acredita conformidad de accesibilidad. |
| `RN-VUE-005` | [Lookup remoto](../../../tests/unit/shared/composables/remoteLookupTest.ts) y [página HTTP](../../../tests/unit/shared/http/pageRequestTest.ts). |
| `RN-VUE-006` | Revisión de responsabilidades conforme al [estándar de código](../../architecture/coding-standards/index.md), ESLint y aislamiento de instancias en [listados](../../../tests/unit/shared/composables/listInteractionTest.ts). |
| `RN-VUE-007` | [Listados de inventario](../../../tests/unit/modules/warehouse/inventoryListTest.ts) y revisión de los consumidores de `useVisibleRefresh`; no representa una medida de rendimiento. |
| `RC-VUE-001` | `npm run check`, manifiestos/lockfile y [herramientas de construcción](../../development/02-tooling.md). |
| `RC-VUE-002` | Build desde el repositorio y revisión de [la imagen y frontera de ejecución](../../architecture/views/physical/runtime-and-build.md). La compilación sola no demuestra un proxy publicado. |
| `RC-VUE-003` | [Sesión de sistema](../../../tests/system/application.spec.ts) y comprobación del proxy y recarga de URL en el alojamiento de destino. |
| `RC-VUE-004` | Revisión de `dist`, contenido de la imagen, reglas de exclusión y [publicación documental](../../governance/02-generation-and-publication.md). |

## Información necesaria para aceptar una entrega

| Información | Registro que debe permitir la revisión |
| --- | --- |
| Alcance y prioridad | IDs y escenarios que forman la entrega, capacidades excluidas y decisiones abiertas que la afectan. No se infiere prioridad por el orden de numeración. |
| Revisión y entorno | Versión del código/contratos, navegador, configuración relevante y datos de prueba, sin secretos. |
| Resultado esperado y real | Criterios acordados y resultado observable; para escrituras críticas, respuesta y persistencia o ausencia de efectos parciales. |
| Evidencia y defectos | Casos DP/CP, ejecución EP o inspección reproducible; defectos, riesgo y límites pendientes. Los resultados no se sobrescriben en la ficha del requisito. |
| Decisión | Responsable funcional designado, fecha, aceptación/rechazo y condiciones expresamente aceptadas. El responsable aún pendiente no se sustituye por una firma de CI. |

El [plan de pruebas](../../testing/01-test-plan.md) define el formato de ejecución y
el [gobierno documental](../../governance/01-documentation-rules.md) conserva el
procedimiento de mantenimiento. Las decisiones aún no acordadas permanecen en el
[registro de pendientes](../vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md).
