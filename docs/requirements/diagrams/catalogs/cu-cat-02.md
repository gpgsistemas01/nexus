# `CU-CAT-02` — Crear proveedor

```mermaid
flowchart TD
    accTitle: CU-CAT-02 — Crear proveedor
    origin{"¿Dónde inicia el alta?"}
    origin -->|Sistemas| list["Nuevo proveedor<br/>desde el listado independiente"]
    origin -->|Operación autorizada| selector["Nuevo proveedor<br/>desde un selector operativo"]
    list --> form["Nexus abre el formulario reutilizable"]
    selector --> form
    form --> validate["Nexus valida permiso, datos e identidad"]
    validate --> create["Registrar proveedor con código único"]
    create -->|Sistemas| refresh["Actualizar listado"]
    create -->|Selector| return["Agregar y seleccionar en el formulario de origen<br/>sin abrir el listado independiente"]
```
