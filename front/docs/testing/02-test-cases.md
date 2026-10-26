# 2. Registro selectivo de casos de prueba Vue

## Alcance y convenciones

Estas fichas concretan casos existentes de riesgo de captura, sesión, concurrencia
y documentos. Los IDs son documentales y enlazan el archivo y título ejecutable;
no se renombra cada test ni se crea otra copia de sus aserciones. Los grupos
`CP-VUE-CAT-002` y `CP-VUE-ISS-002` conservan su identidad; los sufijos distinguen
condiciones con oráculos independientes.

Los datos son fixtures públicas, no cuentas ni credenciales reales. Cada ejecutable
prepara su escenario; estas fichas no requieren ejecutar antes otra ficha. En Playwright
los tests de `tests/e2e` disponen de contexto/página aislados, rutas simuladas y estado
nuevo del harness. Se destruyen al terminar; no hay limpieza SQL en esos casos.
El caso de sistema prepara y limpia fixtures reales según su ficha y procedimiento. En las unitarias se
desmontan componentes y restauran dobles según `tests/setup.ts` y los hooks del caso.
Los resultados esperados siguientes **no** son resultados de ejecución `EP-*`.

<a id="cp-vue-aut-001"></a>

## CP-VUE-AUT-001: captura de login y credencial histórica

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-001`, `CU-AUT-01`, `DP-VAL-002`. Particiones vacío/rechazado/válido y transición de reintento. |
| Precondiciones | Chromium con `mockWarehouse`, ruta `/inicio-sesion` y lista de solicitudes vacía. API y cuenta simuladas. |
| Datos | Nombre `" usuario "`; contraseña rechazada `" legado "` y luego `" válida "`. Las comillas delimitan los valores, no se capturan; cada uno contiene un espacio al inicio y otro al final. Recordar usuario activado. |
| Acción | Abrir y mover foco sin editar; enviar vacío; completar y enviar la credencial rechazada; cambiar la contraseña y reenviar. |
| Resultado esperado | Antes de enviar no hay errores iniciales; vacío muestra errores y no solicita login. Las solicitudes contienen nombre `usuario` y las contraseñas con sus espacios intactos. Rechazo muestra el mensaje genérico; éxito abre Materiales y conserva únicamente `nexus.rememberedUser=usuario` en almacenamiento local. Al volver al login la contraseña está vacía. La cookie de respuesta simulada es HttpOnly. |
| Fuente y limpieza | [login.spec.ts](../../tests/e2e/login.spec.ts), `login: captura inválida, rechazo genérico y reintento con cookies hacia materiales`. Aislamiento Playwright. No comprueba hash, cuenta real ni emisión JWT. |

<a id="cp-vue-session-001-01"></a>

## CP-VUE-SESSION-001-01: renovación transparente

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-002`, soporte de casos protegidos; `DP-VUE-SESSION-001`. Transición acceso vencido → renovación → lectura válida. |
| Precondiciones y datos | `sessionScenario` instala cookies HttpOnly de fixture: acceso vencido y renovación disponible. Destino `/directorio/clientes?consulta=Ana#tabla`; refresh responde texto `OK` y Set-Cookie. |
| Acción | Abrir directamente el destino protegido. |
| Resultado esperado | Una llamada POST a refresh y dos lecturas de `/me`; se presenta Clientes sin pasar por login y se conserva query/fragmento. El navegador almacena `accessToken=renewed-fixture` como HttpOnly. |
| Fuente y limpieza | [sessionRecovery.spec.ts](../../tests/e2e/sessionRecovery.spec.ts), `sesión: un access token vencido se renueva automáticamente mediante la cookie HttpOnly`. Aislamiento Playwright. No demuestra validez criptográfica ni rotación persistente. |

<a id="cp-vue-session-002-01"></a>

## CP-VUE-SESSION-002-01: recuperar un refresh con 502

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-002`; riesgo de confundir indisponibilidad con credenciales inválidas, `DP-VUE-SESSION-002`. Transición 401 → refresh 502 → reintento explícito. |
| Precondiciones y datos | `sessionScenario` nuevo, con acceso vencido y cookie de renovación de fixture; destino `/directorio/clientes?consulta=Ana#tabla`. El primer refresh devuelve 502 y después se cambia la respuesta a 200. |
| Acción | Abrir el destino; observar la pantalla de sesión no disponible; habilitar el refresh y pulsar Volver a comprobar el acceso. |
| Resultado esperado | Se muestra recuperación después del fallo. Antes del clic hay un refresh; al recuperar se presenta Clientes y el contador total es dos. No se exige capturar credenciales de nuevo. |
| Fuente y limpieza | [sessionRecovery.spec.ts](../../tests/e2e/sessionRecovery.spec.ts), `sesión: un 502 del refresh se puede recuperar sin volver a capturar credenciales`. Aislamiento Playwright. El fallo y la recuperación son simulados. |

<a id="cp-vue-cat-002-01"></a>

## CP-VUE-CAT-002-01: conflicto de versión en un catálogo

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-CAT-024`, `CU-CAT-14`; riesgo de sobrescribir una captura antigua, `DP-VUE-CAT-002`. Transición edición → 409 → lectura nueva → edición. |
| Precondiciones | `mockCatalogs`, catálogo Roles y registro de fixture con `version=7`; permisos de administración simulados. |
| Datos | Primera captura `Mi captura`; servidor simulado cambia el nombre y versión a 8 y responde `RECORD_VERSION_CONFLICT`. Segunda captura `Segunda captura`. |
| Acción | Editar/enviar; cerrar mediante Cerrar y actualizar catálogo; abrir otra edición y enviar. |
| Resultado esperado | La primera solicitud conserva `expectedVersion=7`. El rechazo conserva el texto y deshabilita Actualizar; no hay reenvío automático. La lectura muestra el registro actualizado; la siguiente solicitud usa versión 8 y se confirma. |
| Fuente y limpieza | [catalogs.spec.ts](../../tests/e2e/catalogs.spec.ts), `catálogos: conflicto conserva captura, impide reenvío y exige nueva lectura`. Estado en memoria del harness nuevo por test. No comprueba UPDATE condicionado ni persistencia real. |

<a id="cp-vue-com-003-01"></a>

## CP-VUE-COM-003-01: confirmar una corrección de compra

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-REC-002`, `CU-ENT-04`; `DP-VUE-COM-003`. Decisiones cancelar/confirmar sobre la misma captura. |
| Precondiciones y datos | `mockPurchases`, compra `COM-001`, detalle Lona activo con cantidad 2 y costo por presentación 100. Captura de corrección: cantidad 1, costo 100. |
| Acción | Consultar la compra; abrir Corregir detalle; capturar 1; abrir confirmación y cancelar; volver a confirmar aceptando. |
| Resultado esperado | La consulta no ofrece Guardar; la estimación muestra `$116`. Cancelar no genera solicitud ni pierde el diálogo. Confirmar genera una solicitud a `/details/:id/corrections` con `{ quantity: 1, costPerUnitType: 100 }`, conserva la consulta y presenta el mensaje de éxito. |
| Fuente y limpieza | [purchases.spec.ts](../../tests/e2e/purchases.spec.ts), tramo de corrección de `compras: consulta, corrección y cancelación explícita conservan el historial`. El mismo test contiene aserciones adicionales de cancelación, fuera de esta ficha. Aislamiento Playwright; no verifica stock/historial SQL ni el cálculo persistido. |

<a id="cp-vue-iss-002-01"></a>

## CP-VUE-ISS-002-01: surtir un detalle seleccionado

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-ISS-002` / `RF-WST-003`, `CU-SAL-05` / `CU-SAL-19` / `CU-SAL-12`; `DP-VUE-ISS-002`. Selección pendiente y cantidad de proyecto ausente/válida. |
| Precondiciones y datos | `mockIssues`, salida aprobada pendiente con detalle de cantidad 2 y permiso de surtido. Variantes navegador: Materiales/Lona, Consumibles/Lona y Mermas/Sobrante de lona. Cantidad de proyecto 180. |
| Acción | Abrir Surtir detalle; seleccionar el detalle; enviar sin cantidad de proyecto; capturar 180 y reenviar. |
| Resultado esperado | Encabezado bloqueado. El primer intento no genera escritura. El segundo envía sólo `details: [{ id: issueDetailId, isSupplied: true, projectConvertedQuantity: 180 }]` a `/details`; se cierra el diálogo. |
| Fuente y limpieza | [issues.spec.ts](../../tests/e2e/issues.spec.ts), tramo de surtido de `salidas materiales: edición pendiente, surtido y devolución` , `salidas consumibles: edición pendiente, surtido y devolución` y `salidas mermas: edición pendiente, surtido y devolución`. Aislamiento Playwright. No demuestra descuento real ni falta de stock. |

<a id="cp-vue-iss-002-02"></a>

## CP-VUE-ISS-002-02: devolución por la interfaz

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-ISS-003` / `RF-WST-006`, `RN-014`, `CU-SAL-06` / `CU-SAL-20` / `CU-SAL-13`; `DP-VUE-ISS-002`. Frontera superior de cantidad sobre saldo leído. |
| Precondiciones y datos | Continuación del harness de salida ya surtida: cantidad entregada 2, devuelta 0. Dos escrituras previas: surtido y actualización de encabezado. Intentos de devolución 3 y 1. |
| Acción | Abrir devolución; enviar 3; corregir a 1 y enviar. |
| Resultado esperado | Abrir no muestra errores. Con 3 el contador permanece en dos solicitudes; con 1 se envía a `/returns` `{ returnQuantity: 1, observations: '' }` y se cierra el diálogo. |
| Fuente y limpieza | [issues.spec.ts](../../tests/e2e/issues.spec.ts), tramo de devolución del mismo recorrido. Aislamiento Playwright. El incremento del stock y la transacción requieren backend real. |

<a id="cp-vue-iss-002-03"></a>

## CP-VUE-ISS-002-03: precisión y reintento de devolución

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RN-014`, representante de `CU-SAL-06`; `DP-VUE-ISS-002`. Valores frontera y transición rechazo → reintento → desmontaje. |
| Precondiciones y datos | Composable con `suppliedQuantity=2.12`, `returnedQuantity=1.1`; saldo visible 1.02. Servicio simulado rechaza una vez con `Saldo cambió` y luego confirma. |
| Acción | Enviar 1.03; enviar 1.02; repetir explícitamente; desmontar e intentar otro envío. |
| Resultado esperado | 1.03 no llama al servicio. 1.02 conserva captura y mensaje ante rechazo; el siguiente intento notifica la confirmación. Tras desmontar no hay una tercera llamada. |
| Fuente y limpieza | [issueTest.ts](../../tests/unit/modules/issues/issueTest.ts), `devolución limita por el saldo leído, conserva precisión y exige reintento explícito`, con `resource: materials`. Se desmonta el wrapper; los hooks restauran dobles. No es navegador ni persistencia, ni demuestra por sí solo las variantes merma/consumible. |

<a id="cp-vue-wh-011-01"></a>

## CP-VUE-WH-011-01: trasladar un duplicado con cantidad positiva

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-ALM-10` A2, `CU-ALM-13`, `DP-VUE-WH-011`. Transición alta rechazada → cancelar → confirmar → entrada revisada. |
| Precondiciones y datos | `mockWarehouse`, permiso de agregar stock. Alta de merma con plantilla Lona/ROLLO 2 × 50; referencia 10.25 kg, cono 0.25 kg y sobrante 2.75 kg; cantidad inicial 3 y observaciones `Conservar esta captura`. API responde 409 `WASTE_ALREADY_EXISTS`, `operationRejected=true` y contexto de merma sin versión. |
| Acción | Guardar alta, cancelar el aviso; comprobar captura; volver a guardar y confirmar Abrir Agregar stock. Revisar el nuevo editor y después Guardar. |
| Resultado esperado | Cancelar conserva cantidad/observaciones y no registra entrada. Confirmar reemplaza el editor con la identidad recibida y cantidad 3, sin errores iniciales ni escritura automática. Guardar envía una entrada con cantidad 3, observaciones y `operationId` distinto del alta rechazada. No fabrica `expectedVersion`. |
| Fuente y limpieza | [warehouse.spec.ts](../../tests/e2e/warehouse.spec.ts), `mermas: duplicado traslada cantidad 3 y observaciones sólo después de confirmar`. Contexto aislado; APIs simuladas. Unitarias de [recuperación](../../tests/unit/modules/warehouse/wasteDuplicateRecoveryTest.ts) añaden rechazos por permiso, incertidumbre, metadatos y desmontaje. No acredita stock SQL. |

<a id="cp-vue-wh-011-02"></a>

## CP-VUE-WH-011-02: trasladar un duplicado con cantidad cero

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-ALM-10` A2, `CU-ALM-13`, `DP-VUE-WH-011`. Frontera cero/positivo del campo de entrada. |
| Precondiciones y datos | Harness nuevo de `mockWarehouse`, con permiso de entrada y respuesta de duplicado definitivo. La misma plantilla/pesos de la variante positiva; cantidad inicial 0 y observaciones `Conservar esta captura`. No depende de ejecutar otra ficha. |
| Acción | Guardar, cancelar y confirmar un nuevo intento; en Agregar stock enviar vacío; capturar 4 y Guardar. |
| Resultado esperado | La transición conserva las observaciones y deja cantidad vacía, sin errores al abrir. El envío vacío no genera entrada; con 4 se envía una sola entrada, con su propio `operationId`. |
| Fuente y limpieza | [warehouse.spec.ts](../../tests/e2e/warehouse.spec.ts), `mermas: duplicado traslada cantidad 0 y observaciones sólo después de confirmar`. Contexto aislado de navegador con API simulada; no hay limpieza SQL. |

<a id="cp-vue-session-004-01"></a>

## CP-VUE-SESSION-004-01: cierre y rechazo posterior

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-003`, `CU-AUT-02`, `DP-VUE-SESSION-004`. Transición sesión válida → cierre → acceso protegido. |
| Precondiciones y datos | `sessionScenario` nuevo, cookies HttpOnly de fixture y destino Clientes. El handler de cierre simula redirección y eliminación de ambas cookies; después `/me`/refresh rechazan acceso. |
| Acción | Abrir Clientes, pulsar Cerrar sesión y volver a abrir el destino protegido. |
| Resultado esperado | Un POST a `/cerrar-sesion`; login visible; no quedan cookies access/refresh. El acceso directo vuelve al login con destino conservado. El contador de refresh es dos: recuperación inicial y rechazo posterior al cierre. |
| Fuente y limpieza | [sessionRecovery.spec.ts](../../tests/e2e/sessionRecovery.spec.ts), `sesión: cerrar elimina cookies y el acceso directo posterior vuelve al login`. Aislamiento Playwright. El caso de sistema siguiente comprueba además el router real. |

<a id="cp-vue-rec-003-01"></a>

## CP-VUE-REC-003-01: reportes por recurso con recuperación

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-IDA-09`, `CU-CAT-08/04`, `DP-VUE-REC-003`. Misma condición parametrizada por reporte y transición 503 → reintento. |
| Precondiciones y datos | `mockRecords` nuevo por variante: Usuarios con búsqueda `ana`, Clientes/Proveedores con `Central`. Primer reporte responde 503; el siguiente ofrece un blob de fixture con MIME XLSX. |
| Acción | Abrir módulo, aplicar búsqueda, exportar, observar error y volver a pulsar Exportar Excel. |
| Resultado esperado | El fallo muestra Error de descarga y rehabilita el botón. El reintento descarga `.xlsx` del endpoint correspondiente, conserva `search` y omite `start`, `length` y `draw`. Se limpia el error; no hay reintento automático. |
| Fuente y limpieza | [records.spec.ts](../../tests/e2e/records.spec.ts), `reportes Usuarios: exporta filtros sin paginación y recupera una descarga fallida` y variantes `Clientes`/`Proveedores`. Aislamiento Playwright; esta ficha no comprueba filas del archivo simulado. |

<a id="cp-vue-sys-001-01"></a>

## CP-VUE-SYS-001-01: recorrido cliente, servidor y persistencia

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-AUT-01/02`, `CU-CAT-06/08/04`, `CU-IDA-09`, `DP-VUE-SYS-001`. Representante de unión entre capas, filtros y transiciones de sesión. |
| Precondiciones y datos | Base dedicada y migrada según [preparación](04-system-tests.md). `setup.ts` genera sufijo, cuenta de administrador y contraseña de fixture, cuentas/registros excluidos y nombres de cliente/proveedor. El manifiesto temporal identifica los valores exactos de la corrida. Chromium, Vue y Express propios; sin rutas API interceptadas. |
| Acción | Login desde Vue; crear cliente; consultar Prisma y recargar. Filtrar/exportar Usuarios, Clientes y Proveedores; abrir XLSX con ExcelJS. Retirar sólo accessToken, recargar y observar refresh. Cerrar sesión; solicitar `/me`, refresh y una URL protegida. |
| Resultado esperado | Una fila activa de cliente, visible tras recarga. Cada XLSX real tiene encabezado/filas, contiene el representante y excluye la otra fixture. Refresh real 200 restablece cookies HttpOnly. Cierre elimina ambas cookies; `/me` y refresh responden 401 y la URL protegida abre login. El cliente persistido permanece una sola vez. |
| Fuente y limpieza | [application.spec.ts](../../tests/system/application.spec.ts), `sistema: login, alta persistida, reportes reales, renovación y cierre con rutas protegidas`. `setup.ts` limpia sus filas, asignaciones, auditoría y catálogos creados y elimina el manifiesto. No prueba todos los roles, fórmulas o transacciones de inventario. |

<a id="cp-vue-sel-001-01"></a>

## CP-VUE-SEL-001-01: proveedor desde la captura de inventario

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-CAT-02`, soporte de `CU-ALM-02/18`; `DP-VUE-SEL-001`. Variantes Materiales y Consumibles; cancelar → error → confirmar. |
| Precondiciones y datos | `mockWarehouse`, permisos de consulta y alta de proveedor. Artículo `Captura del artículo`, cantidad inicial 5; búsqueda `Proveedor nuevo materials` o `Proveedor nuevo consumables`. Razón social `Empresa nueva`; primer POST de proveedor responde 503, siguiente devuelve registro activo/versionado. |
| Acción | Buscar en Proveedor, elegir Registrar, comprobar precarga y cancelar. Volver a abrir, completar razón social, guardar y observar error; reenviar explícitamente. |
| Resultado esperado | Cancelar no envía POST de proveedor. El error conserva el modal y el nombre comercial. El segundo POST confirma el registro y cierra el auxiliar; el origen conserva nombre/cantidad y muestra el proveedor nuevo aunque la respuesta de opciones siga sin contenerlo. |
| Fuente y limpieza | [selectCreation.spec.ts](../../tests/e2e/selectCreation.spec.ts), `select materials: proveedor precargado, cancelar, error y selección tras guardar` y variante `consumables`. Contexto Playwright aislado; API simulada, sin limpieza SQL. `inventoryFormTest.ts` comprueba rechazo de inactivos y callback tras desmontaje. |

<a id="cp-vue-sel-001-02"></a>

## CP-VUE-SEL-001-02: proveedor y artículo desde una compra

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-CAT-02`, `CU-ALM-02/18`, soporte de `CU-ENT-02/08`; `DP-VUE-SEL-001`. Variantes por recurso con el mismo oráculo de contexto. |
| Precondiciones y datos | `mockPurchases` nuevo por variante. Observaciones `Compra sin guardar`; búsquedas `Proveedor compra materials/consumables` y `Artículo nuevo materials/consumables`. Presentación ROLLO y unidad Metros cuadrados; sólo Materiales captura 2 × 50. |
| Acción | Registrar proveedor desde su desplegable y guardarlo. Desde Material/Consumible abrir Registrar, comprobar nombre y proveedor fijado, completar datos y guardar. |
| Resultado esperado | Ambos registros quedan seleccionados con los IDs de respuesta. Alta del artículo envía el proveedor creado y `creationContext=goodsReceipt`, omite `newStock` y no registra la compra. La captura de observaciones del origen permanece. |
| Fuente y limpieza | [selectCreation.spec.ts](../../tests/e2e/selectCreation.spec.ts), `select compras materials: crea proveedor y artículo desde el desplegable con contexto de compra` y variante `consumables`. Contextos aislados y API simulada. No demuestra alta o stock persistidos. |

<a id="cp-vue-sel-001-03"></a>

## CP-VUE-SEL-001-03: cliente desde una salida

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `CU-CAT-06`, soporte de las capturas de Salidas; `DP-VUE-SEL-001`. Mismo contrato parametrizado en Materiales, Consumibles y Mermas. |
| Precondiciones y datos | `mockIssues`, consulta/alta de clientes y gestión de salida. Observaciones `Salida sin guardar`; búsqueda `Cliente nuevo materiales`, `Cliente nuevo consumibles` o `Cliente nuevo mermas`. POST devuelve cliente activo con ID/version de fixture. |
| Acción | Buscar en Cliente, elegir Registrar cliente, comprobar nombre precargado y Guardar. |
| Resultado esperado | El auxiliar se cierra después de confirmar el alta. El selector muestra el cliente de respuesta; las observaciones del origen permanecen y no hay solicitud de guardar la salida. |
| Fuente y limpieza | [selectCreation.spec.ts](../../tests/e2e/selectCreation.spec.ts), `select salidas materiales: cliente nuevo precargado y elegido sin guardar la salida` y variantes `consumibles`/`mermas`. Aislamiento Playwright; API simulada. Los casos adicionales del archivo comprueban teclado, permisos y consumidores sin alta. |

## Reproducción y resultado real

Los comandos y el ambiente se definen en [el índice de pruebas](index.md#ejecución-y-resultado).
Playwright permite seleccionar el archivo y el título con `--grep`; los nombres
anteriores son los del código, no nuevos casos que deban implementarse.
Para aceptar un resultado se conserva su evidencia `EP-*` con revisión/ambiente,
fecha, comando, estado y discrepancias. No se atribuye un resultado aprobado por
la mera existencia de estas fichas.
