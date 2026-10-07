# 6. Diagramas de reutilización: CRUD e interfaz

El primer diagrama evita representar cliente, proveedor, material, consumible o merma como implementaciones
aisladas cuando el código ya ofrece piezas comunes. Una dependencia UML discontinua apunta desde
el consumidor hacia la pieza que configura o consume, no que todos tengan idénticas reglas. Se
aplican **Factory functions** y **composición sobre herencia**: el recurso inyecta su
configuración y conserva localmente sus reglas de dominio.

**Identificador:** `DIA-COD-REU-001`. **Pregunta:** ¿qué piezas compartidas ya deben
configurarse o componerse antes de implementar otra variante?

```mermaid
---
config:
  class:
    hideEmptyMembersBox: true
---
classDiagram
    direction LR
    namespace Aplicaciones {
        class CrudFactory { <<factory>> }
        class CatalogApplications { <<module>> }
        class ResourceRules { <<policy>> }
    }
    namespace Listados {
        class ListControllerFactory { <<factory>> }
        class ListControllers { <<module>> }
    }
    namespace Formularios {
        class SharedForms { <<boundary>> }
        class CatalogPages { <<boundary>> }
        class DataTablePlugins { <<component>> }
        class Select2Plugins { <<component>> }
    }
    namespace Inventario {
        class MaterialFlow { <<module>> }
        class ConsumableFlow { <<module>> }
        class WasteFlow { <<module>> }
        class InventoryUI { <<component>> }
    }

    CatalogApplications ..> CrudFactory : configura createCrudApplication
    ListControllers ..> ListControllerFactory : inyecta consulta
    CatalogPages ..> SharedForms : reutiliza
    CatalogApplications ..> ResourceRules : conserva reglas del recurso
    CatalogPages ..> DataTablePlugins : usa
    CatalogPages ..> Select2Plugins : usa
    MaterialFlow ..> InventoryUI : usa
    ConsumableFlow ..> InventoryUI : usa
    WasteFlow ..> InventoryUI : usa
```

La diferencia de contexto se conserva en configuraciones, validadores y servicios de
dominio. Antes de agregar otra aplicación o componente se revisan
`src/public/js/application/createCrudApplication.js`,
`src/controllers/api/createDataTableListController.js`, `src/views/shared`,
`src/public/js/ui` y `src/public/js/plugins`.

La revisión del código confirma cuatro puntos de extensión que no necesitan otra
abstracción para sus consumidores actuales:

| Necesidad repetida | Pieza que se reutiliza | Variación que permanece en el propietario |
| --- | --- | --- |
| Listar y mutar recursos desde el navegador | `createCrudApplication` | Requests, claves de respuesta y mutaciones adicionales. |
| Extender el CRUD con encabezado, detalles y devolución | `createIssueApplication` | Servicios, cantidades y reglas de salida de material o merma. |
| Responder catálogos tabulares de sólo lectura | `createDataTableListController` | Función de consulta y mensaje de error del recurso. |
| Adaptar una exportación a un archivo descargable | `createReportApplication` | Request, endpoint y nombre de reporte de cada dominio. |

### Diagrama de realización de la reutilización

**Identificador:** `DIA-COD-REU-002`. **Pregunta:** ¿cómo llegan las abstracciones
compartidas a los módulos de dominio que las aplican actualmente?

```mermaid
---
config:
  class:
    hideEmptyMembersBox: true
---
classDiagram
    direction LR
    namespace Shared {
        class CrudFactory { <<factory>> }
        class IssueFactory { <<factory>> }
        class ListFactory { <<factory>> }
        class ReportFactory { <<factory>> }
    }
    namespace DomainAdapters {
        class CrudModules { <<module>> }
        class IssueModules { <<module>> }
        class ListControllers { <<module>> }
        class ReportModules { <<module>> }
    }
    class CrudOperations { <<interface>> }
    class IssueOperations { <<interface>> }
    class TableResponse { <<interface>> }
    class ReportDownload { <<interface>> }

    CrudModules ..> CrudFactory : configura requests
    IssueFactory ..> CrudFactory : compone operaciones
    IssueModules ..> IssueFactory : configura detalles
    ListControllers ..> ListFactory : inyecta consulta
    ReportModules ..> ReportFactory : inyecta request
    CrudOperations <|.. CrudModules : expone
    IssueOperations <|.. IssueModules : expone
    TableResponse <|.. ListControllers : expone
    ReportDownload <|.. ReportModules : expone
```

Los espacios de nombres agrupan factories y adaptadores. `..>` apunta del consumidor
hacia la dependencia; `<|..` expresa realización del contrato expuesto. Los contratos
son interfaces conceptuales de módulos ES, no declaraciones de clases JavaScript.
La composición de operaciones se expresa como dependencia: no se agrega un rombo de
propiedad si el código sólo reutiliza una factory. `«factory»` y `«module»` son
estereotipos descriptivos locales.

| Aplicación observada | Cómo se materializa | Evidencia que debe revisarse al cambiarla |
| --- | --- | --- |
| Configuración de factory CRUD | Cada módulo pasa `requests` y, cuando corresponde, `dataKeys` o mutaciones adicionales; después exporta operaciones con vocabulario del recurso. | Factory, módulo configurador y pruebas de ambos. |
| Composición de aplicaciones de salida | `createIssueApplication` configura `createCrudApplication` y agrega contratos de encabezado, detalle y devolución para material y merma. | Las dos factories y los módulos `goodsIssues` y `wasteIssues`. |
| Factory de controller tabular | Cada controller inyecta su consulta en `createDataTableListController`; ruta y servicio permanecen en el dominio. | Factory, controllers configuradores y pruebas HTTP del catálogo. |
| Adaptador de reportes | Los módulos de cada área entregan su request a `createReportApplication` y conservan exports específicos. | Factory, servicio de transporte y consumidor que inicia la descarga. |

La concentración de un mecanismo y la existencia de adaptadores pequeños hacen visible
el **resultado estructural** de una refactorización de extracción. El código vigente no
demuestra por sí solo cuándo ocurrió esa transformación; para afirmar su evolución se
necesita además el historial de cambios. Este diagrama documenta cómo queda aplicada hoy,
no reconstruye un “antes y después” hipotético.

Para analizar el impacto se sigue una columna completa: pieza común, configuradores y
contrato observable. Las secuencias `DIA-FE-CU-*` y `DIA-BE-CU-*` muestran después el
recorrido de cada caso y su línea **Patrones** enlaza la colaboración canónica
`DIA-PAT-*`. Los imports del mapa generado y las pruebas de la pieza y sus consumidores
aportan la evidencia que el diagrama no sustituye.

Este capítulo resume la aplicación arquitectónica. Cada diagrama `DIA-FE-CU-*` o
`DIA-BE-CU-*` indica mediante su línea **Patrones** qué pieza compartida consume y
reserva el bloque Mermaid para el recorrido concreto. Cuando una refactorización
extrae, sustituye o elimina una pieza común, se actualizan primero estos diagramas y el
catálogo de patrones, y luego se revisan los casos localizados por esos códigos.
