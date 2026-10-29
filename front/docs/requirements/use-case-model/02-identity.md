# Personas y usuarios: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

## Personas

**Identificador:** `DIA-VUE-CU-002`. **Pregunta:** ¿Qué objetivos puede iniciar cada actor en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")

    systemBoundary identityPackage1["Nexus · Personas"]
        ucPersonQuery("CU-IDA-01 Consultar")
        ucPersonCreate("CU-IDA-02 Crear")
        ucPersonEdit("CU-IDA-03 Editar")
        ucPersonReport("CU-IDA-04 Generar reporte")
    end

    warehouse -- ucPersonQuery
    warehouse -- ucPersonCreate
    warehouse -- ucPersonEdit
    warehouse -- ucPersonReport
```

## Usuarios y credenciales

**Identificador:** `DIA-VUE-CU-003`. **Pregunta:** ¿Qué objetivos puede iniciar cada actor en este recurso?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary identityPackage2["Nexus · Usuarios y credenciales"]
        ucUserQuery("CU-IDA-05 Consultar")
        ucUserCreate("CU-IDA-06 Crear")
        ucUserEdit("CU-IDA-07 Editar")
        ucPasswordEdit("CU-IDA-08 Cambiar contraseña")
        ucUserReport("CU-IDA-09 Generar reporte")
    end

    admin -- ucUserQuery
    admin -- ucUserCreate
    admin -- ucUserEdit
    admin -- ucPasswordEdit
    admin -- ucUserReport
```
