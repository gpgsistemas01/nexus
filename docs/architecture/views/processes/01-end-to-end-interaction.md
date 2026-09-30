# 1. Recorrido extremo a extremo de una interacción

Esta secuencia complementa el
[diagrama de componentes](../logical/01-components-and-reuse.md#componentes-y-conexión-entre-frontend-y-backend):
aquí las flechas representan orden temporal, no dependencias estructurales. El contrato
de cada intercambio permanece en el contrato API y en OpenAPI.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as Vista EJS + JS
    participant R as Ruta / middleware
    participant C as Controlador
    participant S as Servicio
    participant P as Prisma / PostgreSQL

    U->>V: abre una pantalla o ejecuta una acción
    V->>R: petición web o API
    R->>R: autentica, autoriza y valida
    R->>C: delega la petición
    C->>S: coordina el caso de uso
    S->>P: consulta o modifica datos
    P-->>S: resultado
    S-->>C: resultado de dominio
    C-->>V: HTML o JSON
    V-->>U: actualiza la interfaz
```
