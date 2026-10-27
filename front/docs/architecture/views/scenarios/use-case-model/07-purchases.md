# Compras: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Compras de materiales

**Identificador:** `DIA-VUE-CU-018`. **Pregunta:** ¿Qué objetivos y actores participan en Compras de materiales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary receiptPackage1["Nexus · Compras de materiales"]
        ucReceiptQuery("CU-ENT-01 Consultar compras de material")
        ucReceiptCreate("CU-ENT-02 Crear compra de material")
        ucReceiptEdit("CU-ENT-03 Editar compra de material")
        ucReceiptCorrect("CU-ENT-04 Corregir material de una compra")
        ucReceiptCancel("CU-ENT-05 Cancelar material de una compra")
        ucPurchaseReport("CU-ENT-06 Generar reporte de compras de material")
        supplierExtension("CU-CAT-02 Crear proveedor")
        materialExtension("CU-ALM-02 Crear material")
    end

    supplierExtension ..>:extend ucReceiptCreate
    materialExtension ..>:extend ucReceiptCreate

    warehouse -- ucReceiptQuery
    warehouse -- supplierExtension
    warehouse -- materialExtension

    ucReceiptQuery -- ucReceiptCreate
    ucReceiptQuery -- ucReceiptEdit
    ucReceiptQuery -- ucReceiptCorrect
    ucReceiptQuery -- ucReceiptCancel
    ucReceiptQuery -- ucPurchaseReport
```


## Compras de consumibles

**Identificador:** `DIA-VUE-CU-019`. **Pregunta:** ¿Qué objetivos y actores participan en Compras de consumibles?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary receiptPackage2["Nexus · Compras de consumibles"]
        ucConsumableReceiptQuery("CU-ENT-07 Consultar compras de consumible")
        ucConsumableReceiptCreate("CU-ENT-08 Crear compra de consumible")
        ucConsumableReceiptEdit("CU-ENT-09 Editar compra de consumible")
        ucConsumableReceiptCorrect("CU-ENT-10 Corregir consumible de una compra")
        ucConsumableReceiptCancel("CU-ENT-11 Cancelar consumible de una compra")
        ucConsumablePurchaseReport("CU-ENT-12 Generar reporte de compras de consumible")
        supplierExtension("CU-CAT-02 Crear proveedor")
        consumableExtension("CU-ALM-18 Crear consumible")
    end

    supplierExtension ..>:extend ucConsumableReceiptCreate
    consumableExtension ..>:extend ucConsumableReceiptCreate

    warehouse -- ucConsumableReceiptQuery
    warehouse -- supplierExtension
    warehouse -- consumableExtension

    ucConsumableReceiptQuery -- ucConsumableReceiptCreate
    ucConsumableReceiptQuery -- ucConsumableReceiptEdit
    ucConsumableReceiptQuery -- ucConsumableReceiptCorrect
    ucConsumableReceiptQuery -- ucConsumableReceiptCancel
    ucConsumableReceiptQuery -- ucConsumablePurchaseReport
```
