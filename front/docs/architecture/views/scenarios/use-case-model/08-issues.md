# Salidas: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Salidas de materiales

**Identificador:** `DIA-VUE-CU-020`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de materiales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

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

    ucMaterialIssueQuery -- ucMaterialIssueCreate
    ucMaterialIssueQuery -- ucMaterialIssueHeader
    ucMaterialIssueQuery -- ucMaterialIssueDetails
    ucMaterialIssueQuery -- ucMaterialSupply
    ucMaterialIssueQuery -- ucMaterialReturn
    ucMaterialIssueQuery -- ucMaterialIssueReport
```


## Salidas de mermas

**Identificador:** `DIA-VUE-CU-021`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de mermas?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

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

    ucWasteIssueQuery -- ucWasteIssueCreate
    ucWasteIssueQuery -- ucWasteIssueHeader
    ucWasteIssueQuery -- ucWasteIssueDetails
    ucWasteIssueQuery -- ucWasteSupply
    ucWasteIssueQuery -- ucWasteReturn
    ucWasteIssueQuery -- ucWasteIssueReport
```


## Salidas de consumibles

**Identificador:** `DIA-VUE-CU-022`. **Pregunta:** ¿Qué objetivos y actores participan en Salidas de consumibles?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

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

    ucConsumableIssueQuery -- ucConsumableIssueCreate
    ucConsumableIssueQuery -- ucConsumableIssueHeader
    ucConsumableIssueQuery -- ucConsumableIssueDetails
    ucConsumableIssueQuery -- ucConsumableSupply
    ucConsumableIssueQuery -- ucConsumableReturn
    ucConsumableIssueQuery -- ucConsumableIssueReport
```
