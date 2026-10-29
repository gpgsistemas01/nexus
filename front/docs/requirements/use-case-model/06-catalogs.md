# Catálogos administrables: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Áreas

**Identificador:** `DIA-VUE-CU-012`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage3["Nexus · Áreas"]
        ucAreaQuery("CU-CAT-09 Consultar")
        ucAreaCreate("CU-CAT-10 Crear")
        ucAreaEdit("CU-CAT-11 Editar")
    end

    admin -- ucAreaQuery
    admin -- ucAreaCreate
    admin -- ucAreaEdit

    ucAreaCreate ..>:extend ucAreaQuery
    ucAreaEdit ..>:extend ucAreaQuery
```


## Roles

**Identificador:** `DIA-VUE-CU-013`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage4["Nexus · Roles"]
        ucRoleQuery("CU-CAT-12 Consultar")
        ucRoleCreate("CU-CAT-13 Crear")
        ucRoleEdit("CU-CAT-14 Editar")
    end

    admin -- ucRoleQuery
    admin -- ucRoleCreate
    admin -- ucRoleEdit

    ucRoleCreate ..>:extend ucRoleQuery
    ucRoleEdit ..>:extend ucRoleQuery
```


## Presentaciones

**Identificador:** `DIA-VUE-CU-014`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage5["Nexus · Presentaciones"]
        ucPresentationQuery("CU-CAT-15 Consultar")
        ucPresentationCreate("CU-CAT-16 Crear")
        ucPresentationEdit("CU-CAT-17 Editar")
    end

    admin -- ucPresentationQuery
    admin -- ucPresentationCreate
    admin -- ucPresentationEdit

    ucPresentationCreate ..>:extend ucPresentationQuery
    ucPresentationEdit ..>:extend ucPresentationQuery
```


## Unidades de medida

**Identificador:** `DIA-VUE-CU-015`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage6["Nexus · Unidades de medida"]
        ucUnitMeasureQuery("CU-CAT-18 Consultar")
        ucUnitMeasureCreate("CU-CAT-19 Crear")
        ucUnitMeasureEdit("CU-CAT-20 Editar")
    end

    admin -- ucUnitMeasureQuery
    admin -- ucUnitMeasureCreate
    admin -- ucUnitMeasureEdit

    ucUnitMeasureCreate ..>:extend ucUnitMeasureQuery
    ucUnitMeasureEdit ..>:extend ucUnitMeasureQuery
```


## Motivos de ajuste

**Identificador:** `DIA-VUE-CU-016`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage7["Nexus · Motivos de ajuste"]
        ucAdjustmentReasonQuery("CU-CAT-21 Consultar")
        ucAdjustmentReasonCreate("CU-CAT-22 Crear")
        ucAdjustmentReasonEdit("CU-CAT-23 Editar")
    end

    admin -- ucAdjustmentReasonQuery
    admin -- ucAdjustmentReasonCreate
    admin -- ucAdjustmentReasonEdit

    ucAdjustmentReasonCreate ..>:extend ucAdjustmentReasonQuery
    ucAdjustmentReasonEdit ..>:extend ucAdjustmentReasonQuery
```


## Estados de cumplimiento

**Identificador:** `DIA-VUE-CU-017`. **Pregunta:** ¿Cómo se relacionan la consulta, las operaciones y sus actores en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary catalogPackage8["Nexus · Estados de cumplimiento"]
        ucFulfillmentStatusQuery("CU-CAT-24 Consultar")
        ucFulfillmentStatusCreate("CU-CAT-25 Crear")
        ucFulfillmentStatusEdit("CU-CAT-26 Editar")
    end

    admin -- ucFulfillmentStatusQuery
    admin -- ucFulfillmentStatusCreate
    admin -- ucFulfillmentStatusEdit

    ucFulfillmentStatusCreate ..>:extend ucFulfillmentStatusQuery
    ucFulfillmentStatusEdit ..>:extend ucFulfillmentStatusQuery
```
