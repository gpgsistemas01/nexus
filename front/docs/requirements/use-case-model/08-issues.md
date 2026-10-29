# Salidas: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

## Salidas de materiales

**Identificador:** `DIA-VUE-CU-020`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de materiales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage1["Nexus · Salidas de materiales"]
        ucMaterialIssueQuery("CU-SAL-01 Consultar salidas de material")
        ucMaterialIssueCreate("CU-SAL-02 Crear salida de material")
        ucMaterialIssueHeader("CU-SAL-03 Editar encabezado de salida de material")
        ucMaterialIssueDetails("CU-SAL-04 Editar detalles de material de una salida")
        ucMaterialSupply("CU-SAL-05 Surtir material")
        ucMaterialReturn("CU-SAL-06 Devolver material surtido")
        ucMaterialIssueReport("CU-SAL-07 Generar reporte de salidas de material")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    clientExtension ..>:extend ucMaterialIssueCreate

    warehouse -- ucMaterialIssueQuery
    warehouse -- clientExtension
    warehouse -- ucMaterialIssueCreate
    warehouse -- ucMaterialIssueHeader
    warehouse -- ucMaterialIssueDetails
    warehouse -- ucMaterialSupply
    warehouse -- ucMaterialReturn
    warehouse -- ucMaterialIssueReport
    operational -- ucMaterialIssueQuery
    operational -- ucMaterialIssueCreate
    operational -- ucMaterialIssueHeader
    operational -- ucMaterialIssueDetails

    clientExtension ..>:extend ucMaterialIssueHeader
```


## Salidas de mermas

**Identificador:** `DIA-VUE-CU-021`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de mermas?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage2["Nexus · Salidas de mermas"]
        ucWasteIssueQuery("CU-SAL-08 Consultar salidas de merma")
        ucWasteIssueCreate("CU-SAL-09 Crear salida de merma")
        ucWasteIssueHeader("CU-SAL-10 Editar encabezado de salida de merma")
        ucWasteIssueDetails("CU-SAL-11 Editar detalles de merma de una salida")
        ucWasteSupply("CU-SAL-12 Surtir merma")
        ucWasteReturn("CU-SAL-13 Devolver merma surtida")
        ucWasteIssueReport("CU-SAL-14 Generar reporte de salidas de merma")
    end

    warehouse -- ucWasteIssueQuery
    warehouse -- ucWasteIssueCreate
    warehouse -- ucWasteIssueHeader
    warehouse -- ucWasteIssueDetails
    warehouse -- ucWasteSupply
    warehouse -- ucWasteReturn
    warehouse -- ucWasteIssueReport
    operational -- ucWasteIssueQuery
    operational -- ucWasteIssueCreate
    operational -- ucWasteIssueHeader
    operational -- ucWasteIssueDetails
```


## Salidas de consumibles

**Identificador:** `DIA-VUE-CU-022`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de consumibles?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage3["Nexus · Salidas de consumibles"]
        ucConsumableIssueQuery("CU-SAL-15 Consultar salidas de consumible")
        ucConsumableIssueCreate("CU-SAL-16 Crear salida de consumible")
        ucConsumableIssueHeader("CU-SAL-17 Editar encabezado de salida de consumible")
        ucConsumableIssueDetails("CU-SAL-18 Editar detalles de consumible de una salida")
        ucConsumableSupply("CU-SAL-19 Surtir consumible")
        ucConsumableReturn("CU-SAL-20 Devolver consumible surtido")
        ucConsumableIssueReport("CU-SAL-21 Generar reporte de salidas de consumible")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    clientExtension ..>:extend ucConsumableIssueCreate

    warehouse -- ucConsumableIssueQuery
    warehouse -- clientExtension
    warehouse -- ucConsumableIssueCreate
    warehouse -- ucConsumableIssueHeader
    warehouse -- ucConsumableIssueDetails
    warehouse -- ucConsumableSupply
    warehouse -- ucConsumableReturn
    warehouse -- ucConsumableIssueReport
    operational -- ucConsumableIssueQuery
    operational -- ucConsumableIssueCreate
    operational -- ucConsumableIssueHeader
    operational -- ucConsumableIssueDetails

    clientExtension ..>:extend ucConsumableIssueHeader
```
