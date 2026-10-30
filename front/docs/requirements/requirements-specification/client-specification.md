# Requisitos del cliente Vue

El cliente presenta las operaciones autorizadas, conserva la captura y comunica
los resultados de la API. Los campos y efectos por acción están en los
[modos de operación](06-operation-modes-and-effects.md).

## Requisitos funcionales

| ID | Obligación | Condición y resultado esperado |
| --- | --- | --- |
| RF-VUE-001 | El cliente debe permitir iniciar sesión con usuario y contraseña. | Debe conservar el contenido de la contraseña, mostrar los errores corregibles y abrir un destino protegido permitido tras confirmar el acceso. |
| RF-VUE-002 | El cliente debe recuperar el acceso mediante renovación cuando la sesión lo permita. | Ante un 401 de una operación protegida, debe coordinar la renovación y repetir la solicitud como máximo una vez. Un rechazo definitivo vuelve al login; un fallo de conexión permite reintentar y conserva el destino. |
| RF-VUE-003 | El cliente debe limitar la navegación a las páginas permitidas para la cuenta. | Debe comprobar el menú y el acceso por URL. Un 403 debe mostrar acceso denegado; el menú debe cumplir el [estándar de interfaz](../../architecture/interface-standards.md#teclado-y-distribución). |
| RF-VUE-004 | El cliente debe permitir consultar listados con filtros, orden admitido y paginación remota. | Una búsqueda nueva debe comenzar en la primera página. Limpiar debe restablecer los filtros; la interfaz debe distinguir carga, resultados vacíos y fallo con reintento. |
| RF-VUE-005 | El cliente debe presentar los formularios autorizados de Catálogos, Personas, Usuarios, Clientes y Proveedores. | Las altas y ediciones deben enviar sólo los campos del recurso y modo. Usuarios debe distinguir la edición de datos del cambio de contraseña. Las versiones de edición se rigen por `RD-VUE-002`. |
| RF-VUE-006 | El cliente debe presentar las operaciones autorizadas de Materiales y Consumibles con sus campos propios. | Crear, editar, ajustar y retirar deben seguir los [modos de inventario](06-operation-modes-and-effects.md). Consumibles debe omitir dimensiones; Materiales debe habilitarlas según su unidad. |
| RF-VUE-007 | El cliente debe permitir registrar mermas con proveedor, material de referencia y los datos de su presentación. | Cambiar de proveedor debe limpiar el material de referencia y sus datos heredados. Editar, ajustar y agregar stock deben mantener capturas distintas. Los cálculos deben usarse como estimaciones hasta confirmar la operación. |
| RF-VUE-008 | El cliente debe permitir recuperar altas o entradas adicionales de merma cuyo resultado sea incierto. | El reintento debe conservar `operationId` y el cuerpo de la solicitud original, separados por cuenta y operación. La alternativa ante duplicado definitivo se rige por `RF-MER-006`; abrir Agregar stock no debe registrar una entrada. |
| RF-VUE-009 | El cliente debe presentar las operaciones de Compras de Materiales o Consumibles conforme al modo elegido. | Debe conservar los campos y bloqueos de los [modos de compra](06-operation-modes-and-effects.md). Las observaciones del encabezado deben permanecer editables en edición; corregir o cancelar debe requerir confirmación. |
| RF-VUE-010 | El cliente debe presentar las operaciones autorizadas de Salidas según el documento leído. | Debe consultar el documento antes de resolver el modo. Surtir debe actuar sobre los pendientes sin reescribir cantidades ya surtidas o devueltas. Devolver debe limitar la captura al saldo leído; la API debe comprobar el saldo vigente. |
| RF-VUE-011 | El cliente debe permitir consultar Movimientos sin ofrecer escrituras de historial. | Los filtros y reportes deben conservar el contexto de Materiales, Consumibles o Mermas. No deben ofrecerse acciones de editar o eliminar movimientos. |
| RF-VUE-012 | El cliente debe permitir registrar opciones desde los selectores autorizados y volver al formulario de origen. | Debe admitir proveedor desde Materiales, Consumibles o Compras; artículo desde Compras; y cliente desde Salidas. Debe precargar el texto y seleccionar sólo el registro confirmado, conservando la captura principal. |
| RF-VUE-013 | El cliente debe permitir exportar reportes con el alcance elegido. | Debe enviar los filtros admitidos por el reporte o el mes cuando esa opción exista, omitiendo paginación. Un fallo debe permitir reintentar; una respuesta inválida no debe anunciarse como Excel válido. |
| RF-VUE-014 | El cliente debe permitir cerrar la sesión mediante el servidor y volver al login. | Tras confirmar el cierre, debe dejar de presentar los módulos protegidos. Las cookies y la revocación deben seguir el contrato del servidor. |

## Requisitos de datos

| ID | Condición del cliente |
| --- | --- |
| RD-VUE-001 | El cliente debe conservar los identificadores recibidos de la API. Escribir una etiqueta en un selector no debe crear ni deducir el ID del registro. |
| RD-VUE-002 | En Catálogos, Directorio, Personas, Usuarios e inventario, el cliente debe enviar la versión de apertura cuando el contrato de edición o ajuste la exige. Al editar Materiales o Consumibles, debe conservar además `expectedMaterialVersion` de la identidad compartida. No debe agregar versiones a las altas, compras, salidas ni entradas adicionales de merma cuyos contratos no las solicitan. |
| RD-VUE-003 | El cliente debe distinguir un número ausente del valor cero al construir la solicitud. Durante la captura puede conservar números como texto; la conversión debe respetar los campos y tipos del modo elegido. |
| RD-VUE-004 | El cliente debe conservar las contraseñas sin recortarlas y no debe guardarlas en el almacenamiento del navegador. Recordar usuario debe conservar sólo el nombre; las cookies HttpOnly deben ser administradas por el navegador y el servidor. |
| RD-VUE-005 | El cliente debe tratar totales, pesos y conversiones calculados durante la captura como vistas previas. Debe obtener de la API los saldos y resultados confirmados de la operación. |
| RD-VUE-006 | El cliente debe conservar la etiqueta y los datos de la opción seleccionada al paginar. Cambiar o limpiar el ID debe descartar la opción anterior; una respuesta remota del mismo ID debe poder actualizar sus datos. |
| RD-VUE-007 | El cliente debe aceptar una respuesta sólo si cumple el contrato de la operación solicitada. Debe rechazar páginas, documentos, confirmaciones y archivos incompletos o incompatibles antes de usarlos o anunciar éxito. |

## Interacción, calidad y restricciones

| ID | Criterio verificable |
| --- | --- |
| RN-VUE-001 | El cliente no debe mostrar errores por abrir o precargar un formulario intacto. Debe validar un campo al perder el foco si fue modificado o ya se intentó enviar; al enviar, debe validar toda la captura. |
| RN-VUE-002 | El cliente debe bloquear el envío repetido desde sus controles mientras una escritura esté pendiente. Un fallo de red no debe iniciar reenvíos automáticos; la recuperación de merma debe seguir `RF-VUE-008`. |
| RN-VUE-003 | El cliente debe cancelar o invalidar las consultas sustituidas al cambiar el contexto o desmontar la pantalla. Una respuesta anterior no debe reemplazar los datos vigentes ni actualizar otra pantalla. |
| RN-VUE-004 | El cliente debe mostrar los datos recibidos como texto literal, sin interpretar su contenido como HTML, tanto en controles como en avisos. |
| RN-VUE-005 | Las tablas y selectores remotos deben consultar páginas de datos. Los selectores no deben duplicar opciones con el mismo ID y deben terminar la carga adicional al recibir una página vacía, aunque el conteo anuncie más resultados. |
| RN-VUE-006 | La presentación debe recibir datos y emitir intenciones sin consumir servicios HTTP. Los servicios y mappers no deben depender del renderizado. Cada captura o listado debe conservar su estado por instancia y liberar sus recursos al terminar. |
| RN-VUE-007 | Los listados con recarga automática deben actualizarse sólo si la página está visible, no hay una carga incompatible ni una captura protegida y ha transcurrido el intervalo configurado desde el último intento de lectura. La recarga debe conservar los filtros y evitar solicitudes solapadas. |
| RC-VUE-001 | El cliente debe construirse con Vue 3, TypeScript, Composition API y Vue Router, usando versiones compatibles con los manifiestos y el lockfile. |
| RC-VUE-002 | La compilación debe resolver los alias públicos desde el repositorio completo y producir archivos estáticos. La imagen final del frontend no debe ejecutar el backend. |
| RC-VUE-003 | El alojamiento debe servir la API y el cierre de sesión mediante el proxy del mismo origen usado por el cliente. El fallback SPA debe resolver las páginas sin sustituir las respuestas de la API. |
| RC-VUE-004 | La entrega de producción debe excluir fuentes, herramientas y artefactos documentales de `public`, `dist` y la imagen del frontend. |


Los [criterios de aceptación](08-verification-and-acceptance.md) detallan las
condiciones de los recorridos críticos. La
[cobertura de pruebas](../../testing/04-use-case-coverage.md#requisitos-del-cliente)
identifica sus comprobaciones.
