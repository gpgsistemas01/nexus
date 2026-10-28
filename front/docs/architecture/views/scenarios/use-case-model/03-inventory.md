# Inventario: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Materiales

**Identificador:** `DIA-VUE-CU-004`. **Pregunta:** ¿Qué objetivos y actores participan en Materiales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary warehousePackage1["Nexus · Materiales"]
        ucMaterialQuery("CU-ALM-01 Consultar materiales")
        ucMaterialCreate("CU-ALM-02 Crear material")
        ucMaterialEdit("CU-ALM-03 Editar material")
        ucMaterialRemove("CU-ALM-04 Retirar material")
        ucMaterialStock("CU-ALM-05 Ajustar existencia de material")
        ucMaterialInventoryReport("CU-ALM-06 Generar reporte de inventario de materiales")
    end

    warehouse -- ucMaterialQuery
    admin -- ucMaterialStock
    warehouse -- ucMaterialCreate
    warehouse -- ucMaterialEdit
    warehouse -- ucMaterialRemove
    warehouse -- ucMaterialInventoryReport
    operational -- ucMaterialQuery
```


## Mermas

**Identificador:** `DIA-VUE-CU-006`. **Pregunta:** ¿Qué objetivos y actores participan en Mermas?

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
        ucWasteQuery("CU-ALM-09 Consultar mermas")
        ucWasteCreate("CU-ALM-10 Registrar merma")
        ucWasteEdit("CU-ALM-11 Editar merma")
        ucWasteStock("CU-ALM-12 Ajustar existencia de merma")
        ucWasteAddStock("CU-ALM-13 Agregar existencia de merma")
        ucWasteReport("CU-ALM-14 Generar reporte de mermas")
    end

    warehouse -- ucWasteQuery
    admin -- ucWasteStock
    warehouse -- ucWasteCreate
    warehouse -- ucWasteEdit
    warehouse -- ucWasteAddStock
    warehouse -- ucWasteReport
    operational -- ucWasteQuery
```


## Consumibles

**Identificador:** `DIA-VUE-CU-008`. **Pregunta:** ¿Qué objetivos y actores participan en Consumibles?

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
        ucConsumableQuery("CU-ALM-17 Consultar consumibles")
        ucConsumableCreate("CU-ALM-18 Crear consumible")
        ucConsumableEdit("CU-ALM-19 Editar consumible")
        ucConsumableRemove("CU-ALM-20 Retirar consumible")
        ucConsumableStock("CU-ALM-21 Ajustar existencia de consumible")
        ucConsumableReport("CU-ALM-22 Generar reporte de inventario de consumibles")
    end

    warehouse -- ucConsumableQuery
    admin -- ucConsumableStock
    warehouse -- ucConsumableCreate
    warehouse -- ucConsumableEdit
    warehouse -- ucConsumableRemove
    warehouse -- ucConsumableReport
    operational -- ucConsumableQuery
```
