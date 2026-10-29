# Clientes y proveedores: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

Estos cortes representan la consulta y el mantenimiento independientes de Sistemas.
La participación de Almacén en las altas contextuales se representa en Inventario,
Compras y Salidas; no necesita iniciar las consultas de Directorio.

## Proveedores

**Identificador:** `DIA-VUE-CU-010`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage1["Nexus · Proveedores"]
        ucSupplierQuery("CU-CAT-01 Consultar")
        ucSupplierCreate("CU-CAT-02 Crear")
        ucSupplierEdit("CU-CAT-03 Editar")
        ucSupplierReport("CU-CAT-04 Generar reporte")
    end

    admin -- ucSupplierQuery

    ucSupplierQuery -- ucSupplierCreate
    ucSupplierQuery -- ucSupplierEdit
    ucSupplierQuery -- ucSupplierReport
```

## Clientes

**Identificador:** `DIA-VUE-CU-011`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage2["Nexus · Clientes"]
        ucClientQuery("CU-CAT-05 Consultar")
        ucClientCreate("CU-CAT-06 Crear")
        ucClientEdit("CU-CAT-07 Editar")
        ucClientReport("CU-CAT-08 Generar reporte")
    end

    admin -- ucClientQuery

    ucClientQuery -- ucClientCreate
    ucClientQuery -- ucClientEdit
    ucClientQuery -- ucClientReport
```

Almacén participa en el alta únicamente desde un selector de una operación
autorizada. Las consultas independientes, edición y reportes se asocian a Sistemas.
Las lecturas de opciones son soporte del formulario y no un objetivo de mantenimiento.
