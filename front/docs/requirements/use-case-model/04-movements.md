# Movimientos: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Movimientos de materiales

**Identificador:** `DIA-VUE-CU-005`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary materialMovementsPackage["Nexus · Movimientos de materiales"]
        ucMaterialMovements("CU-ALM-07 Consultar")
        ucMaterialMovementReport("CU-ALM-08 Generar reporte")
    end

    admin -- ucMaterialMovements
    admin -- ucMaterialMovementReport

    ucMaterialMovementReport ..>:extend ucMaterialMovements
```


## Movimientos de mermas

**Identificador:** `DIA-VUE-CU-007`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary wasteMovementsPackage["Nexus · Movimientos de mermas"]
        ucWasteMovements("CU-ALM-15 Consultar")
        ucWasteMovementReport("CU-ALM-16 Generar reporte")
    end

    admin -- ucWasteMovements
    admin -- ucWasteMovementReport

    ucWasteMovementReport ..>:extend ucWasteMovements
```


## Movimientos de consumibles

**Identificador:** `DIA-VUE-CU-009`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")
    systemBoundary consumableMovementsPackage["Nexus · Movimientos de consumibles"]
        query("CU-ALM-23 Consultar")
        report("CU-ALM-24 Generar reporte")
    end
    admin -- query
    admin -- report

    report ..>:extend query
```
