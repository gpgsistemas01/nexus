# Acceso y sesión: modelo de casos de uso

[Índice y notación del modelo](index.md#alcance-y-notación).

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
