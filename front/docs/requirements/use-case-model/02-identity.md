# Personas y usuarios: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

La [jerarquía común de actores](01-access.md#autenticación) conserva la participación heredada del Administrador del sistema.

## Personas

**Identificador:** `DIA-VUE-CU-002`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")

    systemBoundary identityPackage1["Nexus · Personas"]
        ucPersonQuery("CU-IDA-01 Consultar personas")
        ucPersonCreate("CU-IDA-02 Crear persona")
        ucPersonEdit("CU-IDA-03 Editar persona")
        ucPersonReport("CU-IDA-04 Generar reporte de personas")
    end

    warehouse -- ucPersonQuery

    ucPersonQuery -- ucPersonCreate
    ucPersonQuery -- ucPersonEdit
    ucPersonQuery -- ucPersonReport
```

## Usuarios y credenciales

**Identificador:** `DIA-VUE-CU-003`. **Pregunta:** ¿Qué operaciones parten de la consulta y qué actores específicos participan?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor admin("Administrador del sistema")

    systemBoundary identityPackage2["Nexus · Usuarios y credenciales"]
        ucUserQuery("CU-IDA-05 Consultar usuarios")
        ucUserCreate("CU-IDA-06 Crear usuario y asignar acceso")
        ucUserEdit("CU-IDA-07 Editar usuario y acceso")
        ucPasswordEdit("CU-IDA-08 Cambiar contraseña de usuario")
        ucUserReport("CU-IDA-09 Generar reporte de usuarios")
    end

    admin -- ucUserQuery

    ucUserQuery -- ucUserCreate
    ucUserQuery -- ucUserEdit
    ucUserQuery -- ucPasswordEdit
    ucUserQuery -- ucUserReport
```
