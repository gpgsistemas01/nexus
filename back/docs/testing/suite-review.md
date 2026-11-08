# Revisión de las suites de API y cliente Vue

## Retiro de la presentación sustituida

Se retiran plantillas, controllers de página, rutas renderizadas, plugins de DOM,
CSS y scripts de capturas del backend. Las pruebas exclusivas de esos componentes
se retiran junto con su objeto de prueba. La historia de sus revisiones se conserva
en Git; el inventario vigente corresponde a los archivos ejecutables actuales.

| Cobertura retirada | Motivo | Cobertura que permanece |
| --- | --- | --- |
| Renderizado, navegación y datos embebidos en plantillas. | Vue Router y componentes implementan la interfaz. | Guardas y navegación en `front/tests/unit/app`; Chromium y sistema en `front/tests`. |
| Formularios, plugins, tablas y modales del cliente anterior. | Sus componentes fueron sustituidos. | Estado, payload, errores, recuperación y tablas en las suites Vue por dominio. |
| Requests y aplicaciones del navegador anterior. | Los servicios Vue comparten `apiClient`. | `apiClientTest.ts`, pruebas de servicios por recurso y recorridos de sesión. |
| Automatización e inventario de capturas del backend. | Los manuales se publican desde `front/` por cuenta. | Herramientas y pruebas Vue de documentación, perfiles y capturas. |
| Comprobaciones de página mezcladas con permisos de API. | La navegación se decide en Vue y la API controla cada operación. | HTTP/Prisma con sesión y permisos reales; 404 JSON del proceso y guardas Vue. |

## Reglas y contratos conservados

Las validaciones públicas se trasladan a `src/shared/validation`, con sus pruebas
en `tests/unit/shared/validation`. Se conservan cálculos de merma, contratos de
mensajes, paridad con `express-validator`, límites, rechazos, autorización y reglas
de dominio. Los helpers utilizados sólo por la especificación de captura están
en `tests/helpers`.

Las integraciones mantienen HTTP, lectura posterior con Prisma, movimientos,
rollback, conflictos e idempotencia. Las pruebas de migración conservan estados
históricos. El retiro de la presentación no elimina reglas de stock ni migraciones.

## Evidencia del límite HTTP

`runtime/appTest.js` comprueba salud, 404 JSON de las rutas retiradas y cierre de
cookies con redirección 303 hacia Vue. `operationalAccessDbTest.js` mantiene las
operaciones permitidas y rechazadas con JWT, permisos y PostgreSQL reales.
`front/tests/system/application.spec.ts` verifica acceso, escritura persistida,
reportes, renovación y cierre con ambos procesos.

## Límites y ejecución

Los dobles HTTP de Chromium demuestran interacción con Vue y sus requests; no
sustituyen autorización ni persistencia del servidor. Las pruebas de sistema son
representativas y no demuestran todos los roles, cálculos o transacciones.
Las [fichas y matriz Vue](../../../front/docs/testing/index.md) conservan esa trazabilidad.

El [plan](test-plan.md) define niveles, técnicas y comandos. Las unitarias y la
integración permanecen separadas. Los resultados de cada corrida se conservan en
CI o en la revisión del cambio; no se versionan reportes de ejecución.
