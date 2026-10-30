# 7. Condiciones de operación

## Intercambios con la API

| Intercambio | Resultado requerido |
| --- | --- |
| Sesión | Iniciar, renovar y cerrar sesión con las cookies administradas por el navegador y el servidor. |
| Consulta | Recibir datos del recurso solicitado; los listados incluyen filas y conteos válidos. |
| Escritura | Recibir los datos y la confirmación exigidos por la operación antes de anunciar éxito; un código HTTP favorable no basta si la respuesta está incompleta. |
| Reporte | Recibir un archivo del tipo admitido; HTML o JSON de error no deben presentarse como Excel. |

Los métodos, rutas, campos y códigos están en los
[contratos HTTP](../../architecture/contracts/client-contracts.md). Las condiciones
sobre identidad, números, versiones y respuestas se definen en los
[requisitos de datos](client-specification.md#requisitos-de-datos).

## Dependencias y respuesta ante fallos

| Condición necesaria | Si no se cumple |
| --- | --- |
| API disponible y compatible | Mostrar el fallo y permitir reintentar; una caída no equivale a credenciales inválidas ni confirma una escritura. |
| Cuenta, asignaciones y catálogos preparados | Respetar el rechazo o la ausencia de opciones; no deducir permisos ni crear datos para suplirlos. |
| Navegador con JavaScript y cookies habilitados | La aplicación necesita ejecutar sus archivos y mantener la sesión. La compatibilidad pendiente se registra en [Decisiones](../vision-scope-and-requirements/04-open-decisions.md). |
| Almacenamiento local disponible para la recuperación de merma | Conservar la operación según `RF-VUE-008`; esta recuperación no equivale a trabajo sin conexión ni a guardar todos los formularios. |
| Alojamiento que resuelva páginas y API | Una URL Vue debe abrir su página; una petición API no debe recibir el HTML de la aplicación. |

Cancelar la espera no revierte los cambios ya confirmados por la API. Una respuesta
anterior tampoco debe reemplazar datos de otra pantalla o captura.

## Construcción y publicación

El cliente se publica como archivos estáticos y consume la API. Ambos pueden
alojarse en servicios separados manteniendo el origen público configurado para
las peticiones de sesión y datos. Los requisitos `RC-VUE-*` fijan sus restricciones.

La [guía de inicio](../../development/01-getting-started.md) explica la preparación
local; la [guía de despliegue](../../development/03-build-and-deployment.md), la
compilación, el proxy y el alojamiento.
