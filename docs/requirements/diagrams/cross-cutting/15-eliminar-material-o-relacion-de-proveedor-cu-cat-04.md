# 15. Eliminar material o relación de proveedor — `CU-CAT-04`

```mermaid
flowchart TB
    materialRequest["Solicitar eliminación de SupplierMaterial"] --> materialExists{"¿Existe la relación?"}
    materialExists -->|no| materialNotFound["Responder material no encontrado"]
    materialExists -->|sí| materialHistory{"¿El material participa en entradas,<br/>salidas, movimientos, ajustes o correcciones?"}
    materialHistory -->|sí| materialConflict["Rechazar para conservar historia"]
    materialHistory -->|no| materialDeleteRelation["Eliminar relación proveedor-material"]
    materialDeleteRelation --> materialRemaining{"¿Quedan otros proveedores?"}
    materialRemaining -->|sí| materialKeep["Conservar material"]
    materialRemaining -->|no| materialDelete["Eliminar material"]
```

La comprobación y ambas eliminaciones pertenecen a una sola transacción. El listado
reutiliza las mismas relaciones de uso para mostrar `canDelete`; no mantiene una segunda
definición de qué significa «sin historia».
