# `CU-CAT-06` — Crear cliente

```mermaid
flowchart TD
    accTitle: CU-CAT-06 — Crear cliente
    origin{"¿Dónde inicia el alta?"}
    origin -->|Sistemas| list["Nuevo cliente<br/>desde el listado independiente"]
    origin -->|Salida autorizada| selector["Nuevo cliente<br/>desde el selector de la salida"]
    list --> form["Nexus abre el formulario reutilizable"]
    selector --> form
    form --> validate["Nexus valida permiso, datos y asesor opcional"]
    validate --> create["Registrar cliente activo"]
    create -->|Sistemas| refresh["Actualizar listado"]
    create -->|Salida| return["Agregar y seleccionar en el formulario de origen<br/>sin abrir el listado independiente"]
```
