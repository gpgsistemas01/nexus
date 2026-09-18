# 4. Patrón de consulta de catálogos — `CU-CAT-01`, `CU-CAT-09`, `CU-CAT-14`, `CU-CAT-18`; `CU-CAT-25`, `CU-CAT-28`, `CU-CAT-31`, `CU-CAT-34`, `CU-CAT-37` y `CU-CAT-40`

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
