# Incorporación al código del frontend

Nexus presenta inventario, compras, salidas y sus movimientos. El navegador
coordina la captura y consume la API. Para ejecutar el proyecto sigue la
[guía de inicio](../../../development/01-getting-started.md).

## Vocabulario del código Vue

| Nombre | Responsabilidad |
| --- | --- |
| Page | Conectar el estado y las operaciones de una pantalla con su presentación. |
| Workspace | Componer capacidades de varios módulos desde `app/pages`. |
| Componente | Recibir props y comunicar intenciones mediante eventos. |
| Composable `use...` | Conservar estado reactivo y operaciones de una interacción. |
| Servicio | Construir la petición HTTP y comprobar su respuesta. |
| Mapper | Traducir entre captura, solicitud y datos recibidos. |

Un archivo `.vue` reúne script, template y estilos del componente. Los
[patrones](design-and-construction-patterns/index.md) explican props/eventos,
slots, callbacks e inyección en sus aplicaciones concretas.

## Primer recorrido: editar un catálogo

| Abrir | Seguir |
| --- | --- |
| [Router](../../../../src/app/router/index.ts) | Ruta, recurso, permiso y página cargada. |
| [CatalogPage](../../../../src/modules/catalogs/pages/CatalogPage.vue) | Consulta, búsqueda y apertura del editor con acción/fila. |
| [CatalogEditorPage](../../../../src/modules/catalogs/pages/CatalogEditorPage.vue) | Composición entre formulario y editor. |
| [useCatalogEditor](../../../../src/modules/catalogs/composables/useCatalogEditor.ts) | Precarga, validación, versión de apertura y guardado. |
| [catalog.ts](../../../../src/modules/catalogs/catalog.ts) | Contratos y selección de campos en `buildCatalogPayload`. |
| [catalogService](../../../../src/modules/catalogs/services/catalogService.ts) | Método, ruta y confirmación de la escritura. |

La [secuencia de guardado](../processes/03-catalogs-and-directory/01-catalog-record-save.md)
muestra el recorrido completo. Las pruebas de
[editor](../../../../tests/unit/modules/catalogs/catalogEditorTest.ts),
[servicio](../../../../tests/unit/modules/catalogs/catalogServiceTest.ts) y
[navegador](../../../../tests/e2e/catalogs.spec.ts) aportan datos y resultados esperados.

## Dónde realizar un cambio

| Cambio | Punto de partida |
| --- | --- |
| Campo o validación | Contrato, esquema y composable del dominio; después componente y mapper. |
| Estilo o control reutilizado | Componente compartido, tema/defaults y hoja de estilos. |
| Consulta o filtro | Query, composable y servicio. |
| Operación de negocio | Requisito, caso de uso, contrato API y coordinador del dominio. |

La [estructura del código](code-structure.md) localiza carpetas y responsabilidades.
El [procedimiento de revisión](../../../development/04-change-review.md) indica qué
comprobar según el cambio.
