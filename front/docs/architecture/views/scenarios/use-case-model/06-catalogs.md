# Catálogos administrables: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Áreas

**Identificador:** `DIA-VUE-CU-012`. **Pregunta:** ¿Qué objetivos y actores participan en Áreas?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../diagram-reading.md#casos-de-uso).

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
    admin -- ucAreaCreate
    admin -- ucAreaEdit
```


## Roles

**Identificador:** `DIA-VUE-CU-013`. **Pregunta:** ¿Qué objetivos y actores participan en Roles?

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
    admin -- ucRoleCreate
    admin -- ucRoleEdit
```


## Presentaciones

**Identificador:** `DIA-VUE-CU-014`. **Pregunta:** ¿Qué objetivos y actores participan en Presentaciones?

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
    admin -- ucPresentationCreate
    admin -- ucPresentationEdit
```


## Unidades de medida

**Identificador:** `DIA-VUE-CU-015`. **Pregunta:** ¿Qué objetivos y actores participan en Unidades de medida?

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
    admin -- ucUnitMeasureCreate
    admin -- ucUnitMeasureEdit
```


## Motivos de ajuste

**Identificador:** `DIA-VUE-CU-016`. **Pregunta:** ¿Qué objetivos y actores participan en Motivos de ajuste?

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
    admin -- ucAdjustmentReasonCreate
    admin -- ucAdjustmentReasonEdit
```


## Estados de cumplimiento

**Identificador:** `DIA-VUE-CU-017`. **Pregunta:** ¿Qué objetivos y actores participan en Estados de cumplimiento?

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
    admin -- ucFulfillmentStatusCreate
    admin -- ucFulfillmentStatusEdit
```
