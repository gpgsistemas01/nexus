# Compras: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

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
        ucReceiptQuery("CU-ENT-01 Consultar")
        ucReceiptCreate("CU-ENT-02 Crear")
        ucReceiptEdit("CU-ENT-03 Editar")
        ucReceiptCorrect("CU-ENT-04 Corregir detalle")
        ucReceiptCancel("CU-ENT-05 Cancelar detalle")
        ucPurchaseReport("CU-ENT-06 Generar reporte")
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
        ucConsumableReceiptQuery("CU-ENT-07 Consultar")
        ucConsumableReceiptCreate("CU-ENT-08 Crear")
        ucConsumableReceiptEdit("CU-ENT-09 Editar")
        ucConsumableReceiptCorrect("CU-ENT-10 Corregir detalle")
        ucConsumableReceiptCancel("CU-ENT-11 Cancelar detalle")
        ucConsumablePurchaseReport("CU-ENT-12 Generar reporte")
    end

    warehouse -- ucConsumableReceiptQuery

    ucConsumableReceiptQuery -- ucConsumableReceiptCreate
    ucConsumableReceiptQuery -- ucConsumableReceiptEdit
    ucConsumableReceiptQuery -- ucConsumableReceiptCorrect
    ucConsumableReceiptQuery -- ucConsumableReceiptCancel
    ucConsumableReceiptQuery -- ucConsumablePurchaseReport
```
