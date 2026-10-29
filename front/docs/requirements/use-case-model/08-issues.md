# Salidas: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).

## Salidas de materiales

**Identificador:** `DIA-VUE-CU-020`. **Pregunta:** ¿Qué objetivos puede iniciar cada actor en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage1["Nexus · Salidas de materiales"]
        ucMaterialIssueQuery("CU-SAL-01 Consultar")
        ucMaterialIssueCreate("CU-SAL-02 Crear")
        ucMaterialIssueHeader("CU-SAL-03 Editar encabezado")
        ucMaterialIssueDetails("CU-SAL-04 Editar detalles")
        ucMaterialSupply("CU-SAL-05 Surtir")
        ucMaterialReturn("CU-SAL-06 Devolver")
        ucMaterialIssueReport("CU-SAL-07 Generar reporte")
    end

    warehouse -- ucMaterialIssueQuery
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
```

## Salidas de mermas

**Identificador:** `DIA-VUE-CU-021`. **Pregunta:** ¿Qué objetivos puede iniciar cada actor en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage2["Nexus · Salidas de mermas"]
        ucWasteIssueQuery("CU-SAL-08 Consultar")
        ucWasteIssueCreate("CU-SAL-09 Crear")
        ucWasteIssueHeader("CU-SAL-10 Editar encabezado")
        ucWasteIssueDetails("CU-SAL-11 Editar detalles")
        ucWasteSupply("CU-SAL-12 Surtir")
        ucWasteReturn("CU-SAL-13 Devolver")
        ucWasteIssueReport("CU-SAL-14 Generar reporte")
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

**Identificador:** `DIA-VUE-CU-022`. **Pregunta:** ¿Qué objetivos puede iniciar cada actor en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")

    systemBoundary issuePackage3["Nexus · Salidas de consumibles"]
        ucConsumableIssueQuery("CU-SAL-15 Consultar")
        ucConsumableIssueCreate("CU-SAL-16 Crear")
        ucConsumableIssueHeader("CU-SAL-17 Editar encabezado")
        ucConsumableIssueDetails("CU-SAL-18 Editar detalles")
        ucConsumableSupply("CU-SAL-19 Surtir")
        ucConsumableReturn("CU-SAL-20 Devolver")
        ucConsumableIssueReport("CU-SAL-21 Generar reporte")
    end

    warehouse -- ucConsumableIssueQuery
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
```
