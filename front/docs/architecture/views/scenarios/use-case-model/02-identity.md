# Personas y usuarios: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Personas

**Identificador:** `DIA-VUE-CU-002`. **Pregunta:** ¿Qué objetivos y actores participan en Personas?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

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

**Identificador:** `DIA-VUE-CU-003`. **Pregunta:** ¿Qué objetivos y actores participan en Usuarios y credenciales?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

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
