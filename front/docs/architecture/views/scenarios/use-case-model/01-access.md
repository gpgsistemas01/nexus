# Acceso y sesión: modelo de casos de uso

La [leyenda del modelo](index.md#alcance-y-notación) define actores, asociaciones y límites. Las figuras conservan los IDs de los objetivos; sus pasos completos se encuentran en las fichas de requisitos.

## Autenticación

**Identificador:** `DIA-VUE-CU-001`. **Pregunta:** ¿Qué objetivos y actores participan en Autenticación?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso. **Notación y alcance:** UML de casos de uso; asociaciones, generalizaciones y dependencias con su estereotipo. No representa llamadas entre componentes.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor user("Usuario registrado")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    warehouse --|> user
    admin --|> warehouse

    systemBoundary authPackage1["Nexus · Autenticación"]
        ucLogin("CU-AUT-01 Iniciar sesión")
        ucLogout("CU-AUT-02 Cerrar sesión")
    end

    user -- ucLogin
    user -- ucLogout
```
