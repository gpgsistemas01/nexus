# Compras: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

Las relaciones de alta auxiliar se detallan en [Altas desde selectores](09-contextual-creation.md).

## Compras de materiales

**Identificador:** `DIA-VUE-CU-018`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")

    systemBoundary receiptPackage1["Nexus · Compras de materiales"]
        ucReceiptQuery("CU-ENT-01 Consultar compras de material")
        ucReceiptCreate("CU-ENT-02 Crear compra de material")
        ucReceiptEdit("CU-ENT-03 Editar compra de material")
        ucReceiptCorrect("CU-ENT-04 Corregir material de una compra")
        ucReceiptCancel("CU-ENT-05 Cancelar material de una compra")
        ucPurchaseReport("CU-ENT-06 Generar reporte de compras de material")
    end

    warehouse -- ucReceiptQuery

    ucReceiptQuery -- ucReceiptCreate
    ucReceiptQuery -- ucReceiptEdit
    ucReceiptQuery -- ucReceiptCorrect
    ucReceiptQuery -- ucReceiptCancel
    ucReceiptQuery -- ucPurchaseReport
```

## Compras de consumibles

**Identificador:** `DIA-VUE-CU-019`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")

    systemBoundary receiptPackage2["Nexus · Compras de consumibles"]
        ucConsumableReceiptQuery("CU-ENT-07 Consultar compras de consumible")
        ucConsumableReceiptCreate("CU-ENT-08 Crear compra de consumible")
        ucConsumableReceiptEdit("CU-ENT-09 Editar compra de consumible")
        ucConsumableReceiptCorrect("CU-ENT-10 Corregir consumible de una compra")
        ucConsumableReceiptCancel("CU-ENT-11 Cancelar consumible de una compra")
        ucConsumablePurchaseReport("CU-ENT-12 Generar reporte de compras de consumible")
    end

    warehouse -- ucConsumableReceiptQuery

    ucConsumableReceiptQuery -- ucConsumableReceiptCreate
    ucConsumableReceiptQuery -- ucConsumableReceiptEdit
    ucConsumableReceiptQuery -- ucConsumableReceiptCorrect
    ucConsumableReceiptQuery -- ucConsumableReceiptCancel
    ucConsumableReceiptQuery -- ucConsumablePurchaseReport
```
