# 8. Verificación y aceptación de requisitos

## Alcance de la comprobación

El catálogo de producto contiene 166 obligaciones. La especificación del cliente añade
32 obligaciones: 14 funcionales, 7 de datos, 7 de interacción y 4 de construcción u operación.
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

### Acceso y navegación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-001-1` | Después del login, el cliente debe recuperar el destino protegido guardado, con su consulta y fragmento, si sigue siendo válido. Debe descartar destinos externos, ambiguos, desconocidos o de acceso/error y resolver una página autorizada. |
| `CA-RF-VUE-002-1` | Ante respuestas 401 concurrentes de operaciones protegidas, el cliente debe coordinar una renovación y repetir cada solicitud original como máximo una vez en ese recorrido. Un rechazo del login público no debe iniciar la renovación. |
| `CA-RF-VUE-002-2` | Si se rechaza la renovación, el cliente debe solicitar acceso nuevamente y conservar un destino interno permitido. Si falla la conexión o el proxy, debe ofrecer volver a comprobar el acceso; no debe interpretar ese fallo como credenciales inválidas. |
| `CA-RF-VUE-003-1` | Almacén debe conservar lecturas y altas de Clientes/Proveedores desde selectores autorizados, con las páginas independientes reservadas a Sistemas. La restricción debe comprobarse también al abrir una URL directa. |

### Captura de compras y salidas

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-009-1` | En una compra nueva, cambiar el proveedor debe limpiar los detalles preparados y la persona que recibe. Al editar una compra existente, el proveedor debe permanecer bloqueado y la solicitud debe conservar el leído. |
| `CA-RF-VUE-009-2` | Al agregar un detalle de compra, la cantidad debe ser al menos 1 y el costo por presentación debe ser positivo. Corregir un detalle debe admitir cantidades positivas menores que 1, sin superar la cantidad recibida vigente. |
| `CA-RF-VUE-010-1` | Almacén debe poder consultar y preparar salidas para todas las áreas de su acceso. Una cuenta operativa debe limitarse a las suyas: si la respuesta completa sin búsqueda contiene una sola área activa, debe seleccionarse y bloquearse. Una coincidencia de búsqueda no debe bloquear un catálogo múltiple. |
| `CA-RF-VUE-010-2` | En un encabezado editable, cambiar Cliente debe limpiar Asesor y Número de proyecto; cambiar Área debe limpiar Solicitante y Número de proyecto. Las opciones y sugerencias deben actualizarse según la nueva selección. |
| `CA-RF-VUE-010-3` | Al agregar detalles de Materiales o Consumibles, la cantidad debe ser al menos 1. En Mermas, debe ser positiva y puede ser menor que 1. Agregar de nuevo la misma selección debe acumularla según `CA-RF-ISS-004-1` o `CA-RF-WST-002-2`. |
| `CA-RF-VUE-010-4` | Surtir debe exigir al menos un detalle pendiente seleccionado y una Cantidad de proyecto positiva para cada uno. Desmarcarlo debe limpiar esa cantidad de la captura. La solicitud debe omitir detalles ya surtidos o cancelados. |
| `CA-RF-VUE-010-5` | El selector de Asesor debe cargarse después de elegir Cliente: para GPG INTERNO debe ofrecer coordinadores; para otros clientes, personas de Ventas y proyectos especiales o Dirección. Solicitante debe cargarse después de elegir Área y filtrar sus personas. Estas lecturas auxiliares no deben conceder acceso a las áreas consultadas. |
| `CA-RF-VUE-010-6` | Para GPG INTERNO, elegir Cliente y Área debe sugerir el proyecto configurado. La confirmación debe respetar `RN-035`, aunque el campo haya sido alterado en el navegador. |

### Altas contextuales y recuperación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RF-VUE-012-1` | Abrir o cancelar un alta auxiliar no debe guardar el formulario principal. Confirmar el alta debe incorporar y seleccionar el registro activo, conservando la captura de origen. El registro creado debe permanecer aunque después se abandone el documento principal. |
| `CA-RF-VUE-012-2` | Un registro creado como inactivo debe permanecer guardado, pero no debe seleccionarse para una operación nueva que exija registros activos. El alta auxiliar no debe confirmar esa operación principal. |
| `CA-RF-VUE-012-3` | Un resultado auxiliar recibido después de cerrar o desmontar su origen no debe modificar otra captura ni aplicar una selección tardía. |
| `CA-RF-VUE-008-1` | Reintentar una alta o entrada de merma con resultado incierto debe conservar la misma clave de operación y el mismo cuerpo. Cambiar de cuenta o acción no debe recuperar una captura ajena; una entrada adicional debe distinguir también la merma de destino. Un rechazo definitivo por duplicado puede ofrecer otro formulario, pero abrirlo no debe registrar stock. |

### Datos y presentación

| Criterio | Condición y resultado esperado |
| --- | --- |
| `CA-RD-VUE-002-1` | En recursos con contrato versionado, editar o ajustar debe enviar la versión que abrió la captura. Un conflicto debe conservar los datos y exigir consultar la versión vigente; un nuevo intento no debe sustituir automáticamente la versión original. |
| `CA-RD-VUE-007-1` | Una página debe contener una colección de registros y conteos enteros seguros no negativos. Cero debe ser válido para una consulta vacía; conteos negativos, fraccionarios o inválidos deben rechazar la respuesta. |
| `CA-RD-VUE-007-2` | La lectura por ID de una compra o salida debe devolver ese mismo documento y un contexto compatible. Un ID distinto o un tipo explícitamente contrario al recurso solicitado debe impedir usarlo en el editor. |
| `CA-RD-VUE-007-3` | Una escritura debe recibir el código de confirmación de su operación y recurso antes de cerrar como éxito. Si el contrato exige un registro para seleccionar la nueva opción, también debe comprobar su identidad y datos requeridos. Un HTTP 2xx por sí solo no debe confirmar un resultado incompleto. |
| `CA-RD-VUE-007-4` | Una descarga debe recibirse como archivo con el tipo MIME anunciado para XLSX. Una respuesta con tipo HTML o JSON no debe iniciar una descarga presentada como Excel. |
| `CA-RN-VUE-001-1` | Abrir un formulario intacto no debe mostrar errores de captura. Validar un campo modificado o enviar el formulario debe mostrar los errores aplicables sin perder valores corregibles. |
| `CA-RN-VUE-004-1` | Un nombre o mensaje recibido que contenga etiquetas debe mostrarse como texto literal, sin crear elementos HTML ni ejecutar sus manejadores. |
| `CA-RN-VUE-007-1` | Un listado no debe recargarse automáticamente mientras esté oculto, exista una carga incompatible o haya una captura protegida. Si vuelve a ser elegible y transcurrió el intervalo desde el último intento, la siguiente comprobación de actualización debe renovar la consulta sin perder filtros. |

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
| `RD-VUE-007` | [Páginas](../../../tests/unit/shared/http/pageRequestTest.ts), [confirmaciones](../../../tests/unit/shared/http/recordContractTest.ts), documentos de [Compras](../../../tests/unit/modules/purchases/purchaseTest.ts) y [Salidas](../../../tests/unit/modules/issues/issueTest.ts), y [tipo de descarga](../../../tests/unit/modules/warehouse/inventoryReportTest.ts). Revisar también las guardas de ID en los servicios de lectura; la validación MIME no comprueba la estructura interna del XLSX, que se verifica en los representantes de sistema. |
| `RN-VUE-001` | [Login en navegador](../../../tests/e2e/login.spec.ts), [Almacén](../../../tests/e2e/warehouse.spec.ts) y [registros](../../../tests/e2e/records.spec.ts). |
| `RN-VUE-002` | [Guardado y recuperación de merma](../../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts) y [Compras](../../../tests/unit/modules/purchases/purchaseTest.ts). |
| `RN-VUE-003` | [Lookup remoto](../../../tests/unit/shared/composables/remoteLookupTest.ts), [listado de inventario](../../../tests/unit/modules/warehouse/inventoryListTest.ts) y desmontaje de consumidores. |
| `RN-VUE-004` | [Avisos como texto](../../../tests/unit/shared/ui/feedbackTest.ts) y [texto recibido en tablas/formularios](../../../tests/e2e/catalogs.spec.ts). |
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
