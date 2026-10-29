# Inventario: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).

## Materiales

**Identificador:** `DIA-VUE-CU-004`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

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

    systemBoundary warehousePackage1["Nexus · Materiales"]
        ucMaterialQuery("CU-ALM-01 Consultar")
        ucMaterialCreate("CU-ALM-02 Crear")
        ucMaterialEdit("CU-ALM-03 Editar")
        ucMaterialRemove("CU-ALM-04 Retirar oferta")
        ucMaterialStock("CU-ALM-05 Ajustar existencia")
        ucMaterialInventoryReport("CU-ALM-06 Generar reporte")
    end

    warehouse -- ucMaterialQuery
    admin -- ucMaterialStock
    warehouse -- ucMaterialCreate
    warehouse -- ucMaterialEdit
    warehouse -- ucMaterialRemove
    warehouse -- ucMaterialInventoryReport
    operational -- ucMaterialQuery

    ucMaterialCreate ..>:extend ucMaterialQuery
    ucMaterialEdit ..>:extend ucMaterialQuery
    ucMaterialRemove ..>:extend ucMaterialQuery
    ucMaterialStock ..>:extend ucMaterialQuery
    ucMaterialInventoryReport ..>:extend ucMaterialQuery
```


## Mermas

**Identificador:** `DIA-VUE-CU-006`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage2["Nexus · Mermas"]
        ucWasteQuery("CU-ALM-09 Consultar")
        ucWasteCreate("CU-ALM-10 Registrar merma")
        ucWasteEdit("CU-ALM-11 Editar")
        ucWasteStock("CU-ALM-12 Ajustar existencia")
        ucWasteAddStock("CU-ALM-13 Agregar existencia")
        ucWasteReport("CU-ALM-14 Generar reporte")
    end

    warehouse -- ucWasteQuery
    admin -- ucWasteStock
    warehouse -- ucWasteCreate
    warehouse -- ucWasteEdit
    warehouse -- ucWasteAddStock
    warehouse -- ucWasteReport
    operational -- ucWasteQuery

    ucWasteCreate ..>:extend ucWasteQuery
    ucWasteEdit ..>:extend ucWasteQuery
    ucWasteStock ..>:extend ucWasteQuery
    ucWasteAddStock ..>:extend ucWasteQuery
    ucWasteReport ..>:extend ucWasteQuery
```


## Consumibles

**Identificador:** `DIA-VUE-CU-008`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage3["Nexus · Consumibles"]
        ucConsumableQuery("CU-ALM-17 Consultar")
        ucConsumableCreate("CU-ALM-18 Crear")
        ucConsumableEdit("CU-ALM-19 Editar")
        ucConsumableRemove("CU-ALM-20 Retirar oferta")
        ucConsumableStock("CU-ALM-21 Ajustar existencia")
        ucConsumableReport("CU-ALM-22 Generar reporte")
    end

    warehouse -- ucConsumableQuery
    admin -- ucConsumableStock
    warehouse -- ucConsumableCreate
    warehouse -- ucConsumableEdit
    warehouse -- ucConsumableRemove
    warehouse -- ucConsumableReport
    operational -- ucConsumableQuery

    ucConsumableCreate ..>:extend ucConsumableQuery
    ucConsumableEdit ..>:extend ucConsumableQuery
    ucConsumableRemove ..>:extend ucConsumableQuery
    ucConsumableStock ..>:extend ucConsumableQuery
    ucConsumableReport ..>:extend ucConsumableQuery
```
