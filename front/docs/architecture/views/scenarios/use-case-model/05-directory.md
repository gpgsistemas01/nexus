# Clientes y proveedores: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Proveedores

**Identificador:** `DIA-VUE-CU-010`. **Pregunta:** ¿Qué objetivos y actores participan en Proveedores?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")
    actor warehouse("Personal de almacén")
    admin --|> warehouse

    systemBoundary catalogPackage1["Nexus · Proveedores"]
        ucSupplierQuery("CU-CAT-01 Consultar proveedores")
        ucSupplierCreate("CU-CAT-02 Crear proveedor")
        ucSupplierEdit("CU-CAT-03 Editar proveedor")
        ucSupplierReport("CU-CAT-04 Generar reporte de proveedores")
    end

    warehouse -- ucSupplierQuery
    warehouse -- ucSupplierCreate
    admin -- ucSupplierEdit
    admin -- ucSupplierReport
```


## Clientes

**Identificador:** `DIA-VUE-CU-011`. **Pregunta:** ¿Qué objetivos y actores participan en Clientes?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")
    actor warehouse("Personal de almacén")
    admin --|> warehouse

    systemBoundary catalogPackage2["Nexus · Clientes"]
        ucClientQuery("CU-CAT-05 Consultar clientes")
        ucClientCreate("CU-CAT-06 Crear cliente")
        ucClientEdit("CU-CAT-07 Editar cliente")
        ucClientReport("CU-CAT-08 Generar reporte de clientes")
    end

    warehouse -- ucClientQuery
    warehouse -- ucClientCreate
    admin -- ucClientEdit
    admin -- ucClientReport
```
