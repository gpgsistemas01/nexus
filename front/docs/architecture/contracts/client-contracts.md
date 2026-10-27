# Contratos consumidos por el cliente Vue

## Propósito y frontera

Este capítulo describe cómo Vue construye solicitudes, interpreta respuestas y presenta errores. Contiene la información necesaria del cliente sin requerir leer OpenAPI o un documento del backend. El servidor verifica autorización, existencia, relaciones, versiones y transacciones; las comprobaciones del navegador no lo sustituyen.

Los servicios usan `shared/http/apiClient`; no se define un cliente Axios por módulo. Los IDs que forman parte de una ruta se codifican y los filtros se construyen mediante URLSearchParams/adaptadores compartidos. Las rutas de navegador y los endpoints HTTP son conceptos distintos: `/salidas/materiales` abre una página; `/api/warehouse/goods-issues/materials` consulta datos.

## Operaciones y propietarios

| Área | Contrato consumido y datos relevantes |
| --- | --- |
| Acceso | `POST /api/auth/login`: `name` recortado y `password` exacta; operación pública que no renueva ante credenciales rechazadas. `GET /api/auth/me`: usuario con ID, nombre y array de permisos. `POST /api/auth/refresh`: renovación coordinada por Axios. El cierre usa `/cerrar-sesion`. |
| Catálogos | `GET/POST /api/admin/catalogs/:catalog`; edición `PUT /:id`. Lista blanca de seis recursos; nombre/Activo y símbolo sólo en Unidad. Edición añade `expectedVersion`. |
| Personas | `GET/POST /api/admin/persons`, edición `PUT /:id`. Nombre completo y `accesses` con pares área/rol; consulta con `includeAccesses=true` y filtros de área/rol. |
| Usuarios | `GET/POST /api/admin/users`; edición `PATCH /:id`; contraseña `PATCH /:id/password`. Alta incluye contraseña; editar datos no la reenvía; ambos modos de edición conservan versión. |
| Clientes | `GET/POST /api/sales/clients`, edición `PUT /:id`. Nombre/Activo; sin teléfono; versión al editar. |
| Proveedores | `GET/POST /api/warehouse/suppliers`, edición `PUT /:id`. Razón social, nombre comercial y Activo; versión al editar. |
| Inventario | Base `/api/warehouse/materials`, `/consumables` o `/wastes`: GET lista, POST alta, PATCH `/:id` metadatos, PATCH `/:id/stock` ajuste. POST `/:id/stock-additions` es entrada de merma; DELETE usa la identidad de la relación admitida para baja. |
| Compras | Base `/api/warehouse/goods-receipts/materials` o `/consumables`: listado, lectura por ID, alta y edición a través de `purchaseService`; corrección/cancelación de detalle conserva su operación y confirmación propias. |
| Salidas | Base `/api/warehouse/goods-issues/materials`, `/consumables` o `/api/warehouse/waste-issues`: GET listado/ID, POST alta, PATCH edición; `/:id/header` para encabezado y `/:id/details` para surtido. Devolución: PATCH `/:id/details/:detailId/returns`. |
| Reportes | Servicios del recurso construyen filtros/alcance y llaman `requestExcel`. La paginación se elimina. Los endpoints y diferencias de alcance permanecen en cada servicio de reporte. |

La tabla describe contratos existentes del cliente, no habilita todas las acciones para todos los recursos o cuentas. Por ejemplo, la UI de merma no presenta una baja genérica de material ni un formulario de stock inicial de compra.

## Página de datos y selección remota

El contrato paginado incluye `data`, `recordsTotal` y `recordsFiltered`. `requestPage` exige arrays y conteos enteros seguros no negativos antes de presentar la tabla. `recordParams`/adaptadores traducen página y tamaño a `start`/`length`, búsqueda y orden reconocidos por el servidor.

`LookupItem` contiene ID, título, datos de la opción y estado deshabilitado cuando corresponde. `useRemoteLookup` aplica debounce, cancelación, invalidación de respuestas anteriores, eliminación de IDs repetidos y reintento de la página fallida. Una página vacía termina carga aun cuando el conteo esté desactualizado. La selección se conserva por ID con `useSelectedOption`.

Una alta auxiliar recibe `LookupCreation` (`search`, `onCreated`) o `ItemCreation`, que añade proveedor. El callback sólo se invoca después de una confirmación válida; el selector no registra texto como entidad ni asigna un UUID de muestra.

## Escrituras y confirmación

El payload se construye por recurso y operación. Una fila leída no se envía completa como captura. `confirmMutation` exige el código de éxito esperado; una respuesta genérica, de otro recurso u omitida no confirma la escritura. El mensaje se obtiene del catálogo público por código y se presenta como texto.

Los lectores de registros comprueban ID, versión, campos y estado necesarios; los mappers de documentos comprueban estructura y recurso. TypeScript sólo comprueba código estático: el JSON real requiere estas verificaciones. No se inventa costo cero, versión o detalle vacío para encubrir una respuesta incompleta.

| Metadato | Uso y regla del cliente |
| --- | --- |
| `expectedVersion` | Versión leída al abrir una operación versionada. Un conflicto no la reemplaza silenciosamente por una consulta nueva. |
| `expectedMaterialVersion` | Conserva la versión del artículo cuando Inventario distingue artículo y relación con proveedor. |
| `operationId` | Se conserva junto al payload de altas/entradas recuperables de merma; identifica el reintento de la misma intención. |
| `creationContext=goodsReceipt` | Alta de artículo desde Compras; proveedor fijado y sin captura inicial de stock/costo. |
| Campos de consulta/derivados | Se presentan cuando ayudan al usuario, pero se omiten del payload donde no son captura admitida. |

## Sesión, errores y cancelación

| Resultado | Comportamiento del cliente |
| --- | --- |
| 400 con errores de campos | Normaliza el contrato y conserva captura con mensajes corregibles. |
| 401 en operación protegida | Coordina una renovación cuando procede; si se rechaza, vuelve al login con destino permitido conservado. El login público usa su propio rechazo. |
| 403 | Presenta acceso no permitido; conocer el endpoint o el código de permiso no concede acceso. |
| 409 de versión | Conserva captura, bloquea el reenvío incompatible y exige actualizar/reabrir. |
| Duplicado de merma definitivo | Sólo ofrece transición a entrada con permiso y contexto suficiente; confirmar abre otra captura, sin escribir automáticamente. |
| 429 del login | Informa del exceso de intentos; no lo interpreta como credenciales confirmadas. |
| Error de red, timeout o 502 de proxy/refresh | Muestra recuperación; no borra la captura ni afirma que una escritura incierta falló definitivamente. |
| Respuesta incompleta o código de otro recurso | Rechaza el contrato; no cierra el editor anunciando éxito. |

Los servicios reciben `AbortSignal`. Consultas canceladas se invalidan y una respuesta tardía no cambia otra pantalla. Cancelar el navegador no revierte una transacción confirmada; merma utiliza su recuperación específica para resultados inciertos.

## Descargas y salida segura

`requestExcel` recibe Blob y comprueba errores/contrato antes de permitir descarga. Si la API devuelve JSON de error como Blob, se normaliza el mensaje. Los filtros usados son los aplicados, no borradores sin buscar; el archivo no limita sus filas a la página visible. Una fixture Blob no demuestra columnas/fórmulas: el recorrido de sistema abre archivos reales para sus representantes.

Nombres y errores se renderizan mediante texto de Vue/Vuetify o `titleText`/`text` de SweetAlert2. No se escapa globalmente el JSON ni se elimina HTML por recorrer todo request/response; la normalización pertenece al campo y la salida al contexto de presentación.

## Evolución y verificación

Cambiar un endpoint, DTO o código obliga a revisar servicio, mapper, tipos, formulario consumidor, pruebas y esta referencia/módulo. Una modificación compatible del servidor no garantiza compatibilidad con una compilación vieja de Vue si cambió un módulo público incluido en los assets.

La [referencia generada](../views/development/code-reference.md) permite localizar símbolos/imports. Los [módulos](../views/development/frontend-technical-documentation/index.md), [casos locales](../../requirements/index.md) y [plan de pruebas](../../testing/01-test-plan.md) explican intención, flujos y oráculos. El documento HTTP general del producto puede complementar esta lectura, pero no contiene la única definición del comportamiento del frontend.
