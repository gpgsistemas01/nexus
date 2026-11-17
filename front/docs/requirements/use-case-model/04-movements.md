# Movimientos: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

## Movimientos de materiales

**Identificador:** `DIA-VUE-CU-005`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary materialMovementsPackage["Nexus · Movimientos de materiales"]
        ucMaterialMovements("CU-ALM-07 Consultar movimientos de materiales")
        ucMaterialMovementReport("CU-ALM-08 Generar reporte de movimientos de materiales")
    end

    admin -- ucMaterialMovements

    ucMaterialMovements -- ucMaterialMovementReport
```

## Movimientos de mermas

**Identificador:** `DIA-VUE-CU-007`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary wasteMovementsPackage["Nexus · Movimientos de mermas"]
        ucWasteMovements("CU-ALM-15 Consultar movimientos de mermas")
        ucWasteMovementReport("CU-ALM-16 Generar reporte de movimientos de mermas")
    end

    admin -- ucWasteMovements

    ucWasteMovements -- ucWasteMovementReport
```

## Movimientos de consumibles

**Identificador:** `DIA-VUE-CU-009`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")
    systemBoundary consumableMovementsPackage["Nexus · Movimientos de consumibles"]
        query("CU-ALM-23 Consultar movimientos de consumibles")
        report("CU-ALM-24 Generar reporte de movimientos de consumibles")
    end
    admin -- query

    query -- report
```
