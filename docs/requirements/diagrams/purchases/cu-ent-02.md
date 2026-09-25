# `CU-ENT-02` — Crear compra de material

```mermaid
flowchart TD
    accTitle: CU-ENT-02 — Crear compra de material
    request["Actor selecciona Nueva compra"] --> supplier{"¿Proveedor ya catalogado?"}
    supplier -->|No| createSupplier["Iniciar CU-CAT-02<br/>desde Nuevo proveedor"]
    createSupplier --> selectSupplier["Agregar y seleccionar proveedor<br/>sin abrir su listado independiente"]
    supplier -->|Sí| catalogued{"¿Material ya catalogado?"}
    selectSupplier --> catalogued
    catalogued -->|No| create["Registrar identidad y oferta con existencia cero,<br/>sin costo máximo ni ajuste inicial"]
    catalogued -->|Sí| validate
    create --> detail["Capturar cantidad y costo<br/>en el detalle de compra"]
    detail --> validate["Nexus valida encabezado, detalles<br/>y relaciones activas"]
    validate --> active{"¿Proveedor y materiales activos?"}
    active -->|No| reject["Rechazar la compra<br/>sin detalles, movimiento ni stock"]
    active -->|Sí| result["Registrar compra, detalles,<br/>existencias y movimientos"]
```
