# Inventario: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).

## Materiales

**Identificador:** `DIA-VUE-CU-004`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

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
        ucMaterialInventoryReport("CU-ALM-06 Generar reporte")
        ucMaterialStock("CU-ALM-05 Ajustar existencia")
    end

    warehouse -- ucMaterialQuery
    admin -- ucMaterialStock
    operational -- ucMaterialQuery

    ucMaterialQuery -- ucMaterialCreate
    ucMaterialQuery -- ucMaterialEdit
    ucMaterialQuery -- ucMaterialRemove
    ucMaterialQuery -- ucMaterialInventoryReport
    ucMaterialQuery -- ucMaterialStock
```

## Mermas

**Identificador:** `DIA-VUE-CU-006`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

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
        ucWasteAddStock("CU-ALM-13 Agregar existencia")
        ucWasteReport("CU-ALM-14 Generar reporte")
        ucWasteStock("CU-ALM-12 Ajustar existencia")
    end

    warehouse -- ucWasteQuery
    admin -- ucWasteStock
    operational -- ucWasteQuery

    ucWasteQuery -- ucWasteCreate
    ucWasteQuery -- ucWasteEdit
    ucWasteQuery -- ucWasteAddStock
    ucWasteQuery -- ucWasteReport
    ucWasteQuery -- ucWasteStock
```

## Consumibles

**Identificador:** `DIA-VUE-CU-008`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

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
        ucConsumableReport("CU-ALM-22 Generar reporte")
        ucConsumableStock("CU-ALM-21 Ajustar existencia")
    end

    warehouse -- ucConsumableQuery
    admin -- ucConsumableStock
    operational -- ucConsumableQuery

    ucConsumableQuery -- ucConsumableCreate
    ucConsumableQuery -- ucConsumableEdit
    ucConsumableQuery -- ucConsumableRemove
    ucConsumableQuery -- ucConsumableReport
    ucConsumableQuery -- ucConsumableStock
```
