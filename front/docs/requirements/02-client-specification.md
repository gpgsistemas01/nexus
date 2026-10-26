# 2. Especificación del cliente Vue

## Propósito, estado y alcance

Esta especificación describe las obligaciones observables de la aplicación Vue implementada en `front/src`. Sirve para desarrollo, revisión y pruebas del cliente. Está En revisión: describe la realización actual sin acreditar aceptación funcional ni capacidad de carga. Es autónoma; los comportamientos necesarios se explican aquí y en las fichas locales, aunque también existan en la documentación de Express.

Los IDs locales distinguen esta especificación de los requisitos del producto. Una regla común, como conservar la versión leída, se explica en ambas aplicaciones según su responsabilidad. Express autoriza, valida definitivamente y confirma las escrituras; documentarlo aquí no traslada esas funciones a Vue.

## Actores, contexto y límites

| Actor o colaborador | Objetivo y límite |
| --- | --- |
| Visitante sin sesión | Capturar credenciales y recibir un resultado de acceso. No obtiene acceso por escribir una URL protegida. |
| Usuario autenticado | Consultar módulos permitidos, capturar operaciones y descargar reportes autorizados. Sus capacidades proceden de permisos recibidos, no de un rol fijo inventado por el cliente. |
| Operador con escritura | Crear/editar registros o documentos y realizar ajustes, surtidos o devoluciones según recurso, estado y permiso. |
| Administrador autorizado | Mantener Catálogos, Personas, Usuarios, Clientes y Proveedores conforme a la autorización específica de cada módulo. |
| Express API | Proporcionar identidad, permisos, páginas de datos y resultados; resolver persistencia, stock, códigos y conflictos. Es externo al proceso Vue. |

El menú contiene Almacén, Compras, Salidas, Movimientos, Identidad, Directorio comercial y seis Catálogos. La navegación se limita a las capacidades implementadas en el cliente. El cliente no conecta directamente con PostgreSQL ni expone Prisma.

## Requisitos funcionales

| ID | Obligación | Criterio observable y propietario |
| --- | --- | --- |
| RF-VUE-001 | Permitir acceso con usuario y contraseña sin transformar el contenido de la contraseña. | El login conserva errores corregibles; confirmar acceso abre un destino protegido permitido. `auth`, Router y Axios. |
| RF-VUE-002 | Recuperar sesión con refresh cuando el servidor lo permita. | Un 401 de operación protegida puede renovar y repetir la solicitud mediante la coordinación compartida. Rechazo de sesión vuelve a login; fallo de conexión ofrece reintento y conserva destino. Sesión y `apiClient`. |
| RF-VUE-003 | Mostrar y proteger navegación por permisos. | Se comprueban menú y acceso directo; 403 abre acceso denegado. Escritorio conserva barra compacta, expansión y cierre; móvil usa drawer temporal. `app`. |
| RF-VUE-004 | Consultar listados con filtros, orden permitido y paginación remota. | Una búsqueda nueva vuelve a la primera página. Limpiar restablece los filtros; carga, vacío, fallo y reintento son visibles. Páginas y `usePagedList`. |
| RF-VUE-005 | Mantener Catálogos, Personas, Usuarios, Clientes y Proveedores con sus capturas propias. | Sólo se envían campos del recurso y modo. Editar conserva la versión de apertura; conflicto exige recargar. `catalogs`, `identity`, `directory`. |
| RF-VUE-006 | Mantener Materiales y Consumibles con información, medidas y modos de inventario. | Alta, edición, ajuste y baja presentan campos propios. Piezas limpia medidas; Consumibles omite dimensiones. Identidad de artículo y relación con proveedor se conservan separadas. `warehouse`. |
| RF-VUE-007 | Capturar Mermas con proveedor, plantilla y pesos/referencias aplicables. | Cambiar proveedor limpia plantilla y datos heredados. Edición, ajuste y agregar stock mantienen contratos distintos. Los cálculos son vistas previas. `warehouse`. |
| RF-VUE-008 | Recuperar altas/entradas de merma con resultado incierto. | Se conserva `operationId` y payload por usuario/operación. Reintentar repite esa captura. Un duplicado definitivo puede abrir Agregar stock tras confirmar; abrir no escribe. Recuperación de inventario. |
| RF-VUE-009 | Registrar y mantener Compras de Materiales o Consumibles. | Encabezado, partidas nuevas, consulta, corrección y cancelación siguen su modo. Observaciones del encabezado continúan editables. Corregir/cancelar exige confirmación. `purchases`. |
| RF-VUE-010 | Solicitar, editar, surtir y devolver Salidas según el estado leído. | Se consulta por ID antes de resolver modo. Surtido protege partidas persistidas/canceladas; devolución no permite superar el saldo leído. Express vuelve a comprobarlo. `issues`. |
| RF-VUE-011 | Consultar Movimientos sin ofrecer escrituras de historial. | Filtros y reportes conservan el recurso; no aparece una acción genérica de editar/eliminar. `movements`. |
| RF-VUE-012 | Registrar entidades desde los selectores autorizados y volver al origen. | Proveedor desde Materiales/Consumibles y Compras; artículo desde Compras; cliente desde Salidas. Precarga texto y selecciona sólo el registro confirmado. Workspaces y `RemoteSelect`. |
| RF-VUE-013 | Exportar reportes con el alcance elegido. | Usa filtros aplicados o mes cuando el módulo lo permite; omite paginación y conserva recuperación ante error. Una respuesta inválida no se anuncia como Excel válido. Servicios de reporte. |
| RF-VUE-014 | Cerrar sesión mediante el servidor y volver al login. | Confirmado el cierre, el cliente limpia su identidad y deja de presentar módulos protegidos. Cookies y revocación siguen el contrato del servidor. Layout y sesión. |

## Requisitos de datos

| ID | Condición del cliente |
| --- | --- |
| RD-VUE-001 | IDs recibidos son opacos. Texto escrito en un selector no se convierte en un UUID inventado. |
| RD-VUE-002 | `expectedVersion` procede de la lectura que abrió la edición/ajuste. Cuando corresponde se conserva `expectedMaterialVersion`. Crear no fabrica una versión. |
| RD-VUE-003 | Números de captura pueden permanecer como texto mientras se editan; el mapper construye el payload por modo sin convertir una ausencia en cero arbitrariamente. |
| RD-VUE-004 | Contraseñas no se recortan ni se guardan en Storage. Recordar usuario conserva sólo el nombre. El navegador y Express administran cookies HttpOnly. |
| RD-VUE-005 | Totales, pesos y conversiones mostrados son vistas previas; no sustituyen permisos, saldos o resultados persistidos del servidor. |
| RD-VUE-006 | Una opción conserva etiqueta/datos al paginar. Cambiar/limpiar su ID descarta la selección anterior; opciones remotas pueden actualizar sus datos. |

## Interacción, calidad y restricciones

| ID | Criterio verificable |
| --- | --- |
| RN-VUE-001 | Abrir modal, cargar datos o mover foco sin capturar no publica errores. Editar y salir valida el campo; enviar valida toda la captura. |
| RN-VUE-002 | Un envío pendiente bloquea duplicaciones desde sus controles. Un fallo de red no inicia un bucle de escrituras; merma conserva su recuperación específica. |
| RN-VUE-003 | Consultas anteriores se cancelan o invalidan al cambiar contexto y desmontar. Una respuesta tardía no sustituye datos vigentes ni actualiza otra pantalla. |
| RN-VUE-004 | Texto recibido se presenta como texto; avisos usan `titleText`/`text`. Foco, teclado y disposición móvil se apoyan en componentes Vue/Vuetify. |
| RN-VUE-005 | Tablas/selectores consultan páginas; no descargan el catálogo completo para simular paginación remota. IDs repetidos no duplican opciones; página vacía termina la carga. |
| RN-VUE-006 | Presentación recibe props/emite eventos; servicios/mappers no dependen del renderizado. Composables mantienen estado por instancia y liberan recursos. |
| RC-VUE-001 | La SPA usa Vue 3, TypeScript, Composition API y Vue Router con herramientas compatibles de los manifiestos. |
| RC-VUE-002 | Los alias públicos se compilan desde el repositorio completo; la imagen final no necesita código privado ni el proceso Express. |
| RC-VUE-003 | API y cierre de sesión deben compartir un origen coherente mediante proxy. El fallback SPA por sí solo no configura la sesión. |
| RC-VUE-004 | Fuentes, scripts y artefactos documentales permanecen fuera de `public`, `dist` y la imagen de producción. |

No se declara latencia máxima, usuarios concurrentes, certificación de accesibilidad o porcentaje de cobertura: requieren obligaciones y mediciones específicas.

## Trazabilidad y aceptación

Las [fichas de acceso y registros](03-access-and-record-use-cases.md) y las [fichas de inventario y documentos](04-inventory-and-document-use-cases.md) describen actores, flujos, alternativas y postcondiciones. Los módulos explican su realización; el [plan de pruebas](../testing/05-test-plan.md) distingue diseño, caso y ejecución. API simulada demuestra interacción del cliente, no una transacción real. La aceptación conserva estos límites y el estado de revisión.
