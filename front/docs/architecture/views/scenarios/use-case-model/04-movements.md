# Movimientos: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Movimientos de materiales

**Identificador:** `DIA-VUE-CU-005`. **Pregunta:** ¿Qué objetivos y actores participan en Movimientos de materiales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

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

**Identificador:** `DIA-VUE-CU-007`. **Pregunta:** ¿Qué objetivos y actores participan en Movimientos de mermas?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

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

**Identificador:** `DIA-VUE-CU-009`. **Pregunta:** ¿Qué objetivos y actores participan en Movimientos de consumibles?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

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
