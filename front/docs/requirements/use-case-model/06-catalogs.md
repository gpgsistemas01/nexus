# Catálogos administrables: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

## Áreas

**Identificador:** `DIA-VUE-CU-012`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage3["Nexus · Áreas"]
        ucAreaQuery("CU-CAT-09 Consultar área")
        ucAreaCreate("CU-CAT-10 Crear área")
        ucAreaEdit("CU-CAT-11 Editar área")
    end

    admin -- ucAreaQuery

    ucAreaQuery -- ucAreaCreate
    ucAreaQuery -- ucAreaEdit
```

## Roles

**Identificador:** `DIA-VUE-CU-013`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage4["Nexus · Roles"]
        ucRoleQuery("CU-CAT-12 Consultar rol")
        ucRoleCreate("CU-CAT-13 Crear rol")
        ucRoleEdit("CU-CAT-14 Editar rol")
    end

    admin -- ucRoleQuery

    ucRoleQuery -- ucRoleCreate
    ucRoleQuery -- ucRoleEdit
```

## Presentaciones

**Identificador:** `DIA-VUE-CU-014`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage5["Nexus · Presentaciones"]
        ucPresentationQuery("CU-CAT-15 Consultar presentación")
        ucPresentationCreate("CU-CAT-16 Crear presentación")
        ucPresentationEdit("CU-CAT-17 Editar presentación")
    end

    admin -- ucPresentationQuery

    ucPresentationQuery -- ucPresentationCreate
    ucPresentationQuery -- ucPresentationEdit
```

## Unidades de medida

**Identificador:** `DIA-VUE-CU-015`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage6["Nexus · Unidades de medida"]
        ucUnitMeasureQuery("CU-CAT-18 Consultar unidad de medida")
        ucUnitMeasureCreate("CU-CAT-19 Crear unidad de medida")
        ucUnitMeasureEdit("CU-CAT-20 Editar unidad de medida")
    end

    admin -- ucUnitMeasureQuery

    ucUnitMeasureQuery -- ucUnitMeasureCreate
    ucUnitMeasureQuery -- ucUnitMeasureEdit
```

## Motivos de ajuste

**Identificador:** `DIA-VUE-CU-016`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage7["Nexus · Motivos de ajuste"]
        ucAdjustmentReasonQuery("CU-CAT-21 Consultar motivo de ajuste")
        ucAdjustmentReasonCreate("CU-CAT-22 Crear motivo de ajuste")
        ucAdjustmentReasonEdit("CU-CAT-23 Editar motivo de ajuste")
    end

    admin -- ucAdjustmentReasonQuery

    ucAdjustmentReasonQuery -- ucAdjustmentReasonCreate
    ucAdjustmentReasonQuery -- ucAdjustmentReasonEdit
```

## Estados de cumplimiento

**Identificador:** `DIA-VUE-CU-017`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage8["Nexus · Estados de cumplimiento"]
        ucFulfillmentStatusQuery("CU-CAT-24 Consultar estado de cumplimiento")
        ucFulfillmentStatusCreate("CU-CAT-25 Crear estado de cumplimiento")
        ucFulfillmentStatusEdit("CU-CAT-26 Editar estado de cumplimiento")
    end

    admin -- ucFulfillmentStatusQuery

    ucFulfillmentStatusQuery -- ucFulfillmentStatusCreate
    ucFulfillmentStatusQuery -- ucFulfillmentStatusEdit
```
