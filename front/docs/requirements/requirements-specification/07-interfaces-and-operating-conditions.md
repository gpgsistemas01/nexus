# 7. Interfaces y condiciones de operación

## Fronteras e intercambios

Esta sección precisa las condiciones necesarias para cumplir los requisitos. Los
[contratos del cliente](../../architecture/contracts/client-contracts.md) conservan
los métodos, rutas, campos y códigos; no se mantiene aquí otro catálogo de endpoints.

| Interfaz | Condición requerida y resultado observable | Requisitos relacionados |
| --- | --- | --- |
| Navegador y aplicación | Abrir o recargar una URL Vue debe resolver su página. El servidor de archivos distingue el fallback de la SPA de una petición API o de un asset ausente. | `RF-VUE-003`, `RC-VUE-002`, `RC-VUE-003`. |
| Aplicación y sesión | Login, consulta de identidad, renovación y cierre usan el mismo origen visible para el navegador mediante la estrategia de proxy. Las cookies de sesión las administra el navegador; el cliente no necesita leerlas desde JavaScript. | `RF-VUE-001`, `RF-VUE-002`, `RF-VUE-014`, `RD-VUE-004`. |
| Aplicación y datos | Las consultas reciben JSON con estructura comprobable. Un listado exige filas y conteos válidos; una escritura exige la confirmación del recurso y operación. Un código HTTP favorable por sí solo no confirma un contrato incompleto. | `RF-VUE-004` a `RF-VUE-011`, `RD-VUE-007`, `RC-COM-002`. |
| Aplicación y archivos | Una descarga recibe el tipo de archivo admitido; JSON de error o HTML no se anuncia como Excel válido. El navegador inicia la descarga y el usuario necesita una aplicación compatible para abrir el archivo. | `RF-VUE-013`, `RD-VUE-007`, `RC-COM-002`. |
| Compilación y reglas públicas | Los módulos compartidos permitidos se incorporan al compilar. Los assets publicados no consultan rutas del filesystem del servicio API durante la ejecución. Las reglas privadas, secretos y persistencia permanecen en el servidor. | `RC-VUE-001`, `RC-VUE-002`, `RC-SEG-004`. |

API y frontend pueden ejecutarse en servicios o contenedores independientes. Compartir
el origen público de las peticiones no exige compartir proceso ni imagen. El
[despliegue](../../development/03-build-and-deployment.md) especifica cómo proporcionar
assets, fallback y proxy; cambiar a peticiones entre orígenes requiere revisar
cookies, CORS y los escenarios de sesión antes de declarar compatible ese despliegue.

## Supuestos, dependencias y restricciones

| Condición | Consecuencia verificable o actuación ante su ausencia |
| --- | --- |
| API disponible y con contratos compatibles | La operación depende de su respuesta. Una caída, un timeout o un proxy incorrecto produce un fallo recuperable; no se presenta como sesión expirada ni como escritura confirmada. |
| Cuenta, asignaciones y datos preparados | La API determina permisos y áreas. Los selectores necesitan catálogos y referencias existentes; el cliente no crea cuentas, permisos ni existencias para suplir esa preparación. |
| JavaScript y navegador compatibles con la compilación | La SPA necesita ejecutar sus assets y utilizar las capacidades de navegador que consume. Las pruebas automatizadas usan Chromium; todavía no existe una matriz aprobada de versiones de Chrome, Edge, Firefox o Safari. |
| Cookies admitidas para el origen y atributos configurados | Son necesarias para conservar y renovar sesión. Copiar tokens a Storage no constituye una alternativa de acceso. |
| Almacenamiento local disponible cuando se usa recuperación de merma | La recuperación conserva el payload y `operationId` de esa operación, separados por cuenta, acción y recurso. No equivale a guardar todos los formularios ni a trabajar sin conexión. Las credenciales no forman parte de ese registro. |
| Entorno de construcción reproducible | Se usan el rango Node y dependencias declarados, el lockfile y las fuentes públicas requeridas del repositorio. El servicio estático final no necesita ejecutar Node, Prisma ni conectarse a la base. |
| Servicio publicado con transporte y proxy adecuados | La configuración debe permitir assets, API y cierre de sesión sin publicar secretos. El fallback no debe sustituir una respuesta API por HTML. |

Los comandos, ubicaciones de archivos y valores de configuración pertenecen a la
[guía de inicio](../../development/01-getting-started.md). Las fuentes de arquitectura
de esta frontera son `vite.config.ts`, `nginx.conf`, `Dockerfile` y los servicios HTTP;
sus diagramas están en [ejecución y construcción](../../architecture/views/physical/runtime-and-build.md).

## Datos y fallos en la frontera

| Situación | Obligación de interpretación |
| --- | --- |
| ID, folio y versión | El ID identifica el recurso; el folio lo asigna la API. Una edición conserva la versión de apertura y no la reemplaza para forzar un reintento. Crear no fabrica una versión. |
| Número ausente, precisión y fecha | Los mappers distinguen vacío de cero y convierten sólo la captura admitida. Las fechas de negocio se interpretan con las utilidades de zona horaria del proyecto; no se sustituyen por marcas técnicas. Los cálculos del cliente son vistas previas. |
| Validación, permiso o conflicto | Se identifica el rechazo, se conserva la captura recuperable y no se anuncia éxito. Los errores de campos, el acceso denegado y el conflicto requieren respuestas distintas. |
| Cancelación o respuesta tardía | Desmontar o cambiar de contexto impide aplicar resultados anteriores a otra pantalla. Cancelar una petición no revierte una operación ya confirmada por la API. |
| Resultado de escritura incierto | Un fallo de conexión no demuestra que la API haya rechazado la operación. La recuperación de merma repite su intención conservada; los demás flujos no obtienen idempotencia por tener deshabilitado el botón. |

Estas condiciones desarrollan `RD-VUE-001` a `RD-VUE-006` y `RN-VUE-002/003`.
Los estados de negocio pertenecen al [modelo de dominio](../domain-model/index.md);
los estados de carga, error y recuperación pertenecen a la interacción del cliente.

## Límites de calidad por acordar

La compatibilidad de navegadores, el nivel de accesibilidad exigido, los objetivos de
rendimiento/disponibilidad y la política de retención de datos necesitan condiciones
medibles y aceptación. Sus decisiones abiertas se concentran en
[brechas y decisiones pendientes](../vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md).
El timeout HTTP de 15 segundos y el intervalo de actualización visible de 30 segundos
son valores actuales de implementación, no un SLA ni una promesa de que cada listado
se actualizará exactamente en ese plazo.
