# Patrón de consulta de catálogos — `CU-CAT-01`, `CU-CAT-10`, `CU-CAT-15`, `CU-CAT-19` y `CU-CAT-27` a `CU-CAT-30`; `CU-CAT-31`, `CU-CAT-34`, `CU-CAT-37`, `CU-CAT-40`, `CU-CAT-43` y `CU-CAT-46`

```mermaid
flowchart LR
    catalogRoute["Router del catálogo<br/>GET y permiso"] --> catalogController["Controller de listado<br/>configuración del recurso"]
    catalogController --> listFactory["createDataTableListController<br/>normalizar paginación y filtros"]
    listFactory --> catalogService["Servicio del catálogo<br/>buscar y contar"]
    catalogService --> catalogDb[("Prisma")]
    catalogDb --> catalogResponse["Página del recurso"]
```

La fábrica de listado se reutiliza cuando el recurso la configura; el diagrama no afirma
que todos los catálogos compartan filtros o permisos. Los routers y servicios concretos
siguen siendo las fuentes verificables de cada variante.
