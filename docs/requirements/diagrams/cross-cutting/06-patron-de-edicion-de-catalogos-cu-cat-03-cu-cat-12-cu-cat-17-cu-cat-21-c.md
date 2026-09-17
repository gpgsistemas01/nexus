# 6. Patrón de edición de catálogos — `CU-CAT-03`, `CU-CAT-12`, `CU-CAT-17`, `CU-CAT-21`, `CU-CAT-33`, `CU-CAT-36`, `CU-CAT-39`, `CU-CAT-42`, `CU-CAT-45` y `CU-CAT-48`

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
