# Inventario: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).
Los ajustes y reportes son extensiones opcionales de la consulta. `«extend»` indica
que se inician desde ella; las asociaciones actor–caso fijan quién puede ejecutarlos.
El ajuste se asocia sólo con el Administrador. El reporte se asocia con Personal de
almacén y el Administrador hereda esa participación.

El mantenimiento del catálogo de Artículos es una capacidad independiente de las
existencias por proveedor. Sólo los usuarios con `material-catalogs:manage` pueden
consultarla y modificar identidades.

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
        ucMaterialQuery("CU-ALM-01 Consultar materiales")
        ucMaterialCreate("CU-ALM-02 Crear existencia de material")
        ucMaterialEdit("CU-ALM-03 Editar existencia de material")
        ucMaterialRemove("CU-ALM-04 Retirar oferta de material")
        ucMaterialInventoryReport("CU-ALM-06 Generar reporte de inventario de materiales")
        ucMaterialStock("CU-ALM-05 Ajustar existencia de material")
    end

    warehouse -- ucMaterialQuery
    admin -- ucMaterialStock
    operational -- ucMaterialQuery
    warehouse -- ucMaterialInventoryReport

    ucMaterialQuery -- ucMaterialCreate
    ucMaterialQuery -- ucMaterialEdit
    ucMaterialQuery -- ucMaterialRemove
    ucMaterialInventoryReport ..>:extend ucMaterialQuery
    ucMaterialStock ..>:extend ucMaterialQuery
```

## Artículos

**Identificador:** `DIA-VUE-CU-013`. **Pregunta:** ¿quién consulta y mantiene las identidades de artículos?

**Fuente:** `APP_NAVIGATION`, permisos de catálogo y fichas `CU-ALM-25` a `CU-ALM-27`.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary articleCatalog["Nexus · Artículos"]
        articlesQuery("CU-ALM-25 Consultar artículos")
        articleCreate("CU-ALM-26 Crear artículo")
        articleEdit("CU-ALM-27 Editar artículo")
        materialOffer("CU-ALM-02 Crear existencia de material")
        consumableOffer("CU-ALM-18 Crear existencia de consumible")
    end

    warehouse -- articlesQuery
    articlesQuery -- articleCreate
    articlesQuery -- articleEdit
    articleCreate ..>:extend materialOffer
    articleCreate ..>:extend consumableOffer
```

Los vínculos con proveedor y las existencias se gestionan desde sus flujos de
[Almacén](../use-cases/warehouse/index.md) y [Compras](../use-cases/purchases/index.md).

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
        ucWasteQuery("CU-ALM-09 Consultar mermas")
        ucWasteCreate("CU-ALM-10 Registrar merma")
        ucWasteEdit("CU-ALM-11 Editar merma")
        ucWasteAddStock("CU-ALM-13 Agregar existencia de merma")
        ucWasteReport("CU-ALM-14 Generar reporte de mermas")
        ucWasteStock("CU-ALM-12 Ajustar existencia de merma")
    end

    warehouse -- ucWasteQuery
    admin -- ucWasteStock
    operational -- ucWasteQuery
    warehouse -- ucWasteReport

    ucWasteQuery -- ucWasteCreate
    ucWasteQuery -- ucWasteEdit
    ucWasteQuery -- ucWasteAddStock
    ucWasteReport ..>:extend ucWasteQuery
    ucWasteStock ..>:extend ucWasteQuery
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
        ucConsumableQuery("CU-ALM-17 Consultar consumibles")
        ucConsumableCreate("CU-ALM-18 Crear existencia de consumible")
        ucConsumableEdit("CU-ALM-19 Editar existencia de consumible")
        ucConsumableRemove("CU-ALM-20 Retirar oferta de consumible")
        ucConsumableReport("CU-ALM-22 Generar reporte de inventario de consumibles")
        ucConsumableStock("CU-ALM-21 Ajustar existencia de consumible")
    end

    warehouse -- ucConsumableQuery
    admin -- ucConsumableStock
    operational -- ucConsumableQuery
    warehouse -- ucConsumableReport

    ucConsumableQuery -- ucConsumableCreate
    ucConsumableQuery -- ucConsumableEdit
    ucConsumableQuery -- ucConsumableRemove
    ucConsumableReport ..>:extend ucConsumableQuery
    ucConsumableStock ..>:extend ucConsumableQuery
```
