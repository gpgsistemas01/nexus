# Acceso y sesión: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Autenticación

**Identificador:** `DIA-VUE-CU-001`. **Pregunta:** ¿Qué objetivos y actores participan en Autenticación?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

**Lectura visual:** [actores, objetivos y relaciones](../../architecture/views/diagram-reading.md#casos-de-uso).

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor user("Usuario registrado")
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    operational --|> user
    warehouse --|> user
    admin --|> warehouse

    systemBoundary authPackage1["Nexus · Autenticación"]
        ucLogin("CU-AUT-01 Iniciar sesión")
        ucLogout("CU-AUT-02 Cerrar sesión")
    end

    user -- ucLogin
    user -- ucLogout
```

El triángulo apunta al actor general. Personal de almacén y Usuario de área operativa
heredan las asociaciones de Usuario registrado, pero no las del otro. Administrador
del sistema hereda las de Personal de almacén y agrega sus objetivos exclusivos.
Por eso no se repiten las líneas de autenticación para cada especialización ni las
operaciones de Almacén para el administrador. Una generalización entre actores no
establece `include` ni `extend` entre sus objetivos.
