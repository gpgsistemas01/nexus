# 6. Patrón de edición de catálogos — `CU-ALM-03`, `CU-CAT-03`, `CU-CAT-08`, `CU-ALM-11`, `CU-CAT-12`, `CU-CAT-15`, `CU-CAT-18`, `CU-CAT-21`, `CU-CAT-24` y `CU-CAT-27`

```mermaid
flowchart LR
    catalogEditRoute["PUT o PATCH del recurso<br/>validación y permiso"] --> catalogEditController["Controller<br/>identificador y cambios"]
    catalogEditController --> catalogEditService["Servicio del recurso<br/>existencia · identidad · relaciones"]
    catalogEditService --> catalogEditDb[("Prisma<br/>actualizar")]
    catalogEditDb --> catalogEditUi["Respuesta y refresco CRUD"]
```

El método HTTP y los campos editables dependen del router concreto. La vista sólo
reutiliza la cadena estable de capas y no supone que crear y editar tengan exactamente
las mismas validaciones.
