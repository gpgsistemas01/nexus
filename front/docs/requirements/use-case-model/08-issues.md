# Salidas: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).

Las asociaciones representan participación autorizada: las áreas operativas consultan,
registran y editan sus solicitudes; Personal de almacén también surte, devuelve y genera
reportes. El Administrador del sistema hereda las funciones de almacén. Una consulta no
concede por sí misma acceso a las demás operaciones.
El alta contextual de cliente se modela aparte: sólo aparece para actores con permisos
de lectura y alta de Directorio, cuando escriben en el selector un nombre sin coincidencia.
La extensión no concede esos permisos a las áreas operativas.

## Salidas de materiales

**Identificador:** `DIA-VUE-CU-020`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage1["Nexus · Salidas de materiales"]
        ucMaterialIssueQuery("CU-SAL-01 Consultar")
        ucMaterialIssueCreate("CU-SAL-02 Crear")
        ucMaterialIssueHeader("CU-SAL-03 Editar encabezado")
        ucMaterialIssueDetails("CU-SAL-04 Editar detalles")
        ucMaterialSupply("CU-SAL-05 Surtir")
        ucMaterialReturn("CU-SAL-06 Devolver")
        ucMaterialIssueReport("CU-SAL-07 Generar reporte")
    end

    operational -- ucMaterialIssueQuery
    operational -- ucMaterialIssueCreate
    operational -- ucMaterialIssueHeader
    operational -- ucMaterialIssueDetails
    warehouse -- ucMaterialIssueQuery
    warehouse -- ucMaterialIssueCreate
    warehouse -- ucMaterialIssueHeader
    warehouse -- ucMaterialIssueDetails
    warehouse -- ucMaterialSupply
    warehouse -- ucMaterialReturn
    warehouse -- ucMaterialIssueReport
```

## Salidas de mermas

**Identificador:** `DIA-VUE-CU-021`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage2["Nexus · Salidas de mermas"]
        ucWasteIssueQuery("CU-SAL-08 Consultar")
        ucWasteIssueCreate("CU-SAL-09 Crear")
        ucWasteIssueHeader("CU-SAL-10 Editar encabezado")
        ucWasteIssueDetails("CU-SAL-11 Editar detalles")
        ucWasteSupply("CU-SAL-12 Surtir")
        ucWasteReturn("CU-SAL-13 Devolver")
        ucWasteIssueReport("CU-SAL-14 Generar reporte")
    end

    operational -- ucWasteIssueQuery
    operational -- ucWasteIssueCreate
    operational -- ucWasteIssueHeader
    operational -- ucWasteIssueDetails
    warehouse -- ucWasteIssueQuery
    warehouse -- ucWasteIssueCreate
    warehouse -- ucWasteIssueHeader
    warehouse -- ucWasteIssueDetails
    warehouse -- ucWasteSupply
    warehouse -- ucWasteReturn
    warehouse -- ucWasteIssueReport
```

## Salidas de consumibles

**Identificador:** `DIA-VUE-CU-022`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage3["Nexus · Salidas de consumibles"]
        ucConsumableIssueQuery("CU-SAL-15 Consultar")
        ucConsumableIssueCreate("CU-SAL-16 Crear")
        ucConsumableIssueHeader("CU-SAL-17 Editar encabezado")
        ucConsumableIssueDetails("CU-SAL-18 Editar detalles")
        ucConsumableSupply("CU-SAL-19 Surtir")
        ucConsumableReturn("CU-SAL-20 Devolver")
        ucConsumableIssueReport("CU-SAL-21 Generar reporte")
    end

    operational -- ucConsumableIssueQuery
    operational -- ucConsumableIssueCreate
    operational -- ucConsumableIssueHeader
    operational -- ucConsumableIssueDetails
    warehouse -- ucConsumableIssueQuery
    warehouse -- ucConsumableIssueCreate
    warehouse -- ucConsumableIssueHeader
    warehouse -- ucConsumableIssueDetails
    warehouse -- ucConsumableSupply
    warehouse -- ucConsumableReturn
    warehouse -- ucConsumableIssueReport
```
