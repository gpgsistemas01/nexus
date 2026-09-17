# 4. Patrón de consulta de catálogos — `CU-CAT-01`, `CU-CAT-10`, `CU-CAT-15`, `CU-CAT-19`; `CU-CAT-27`, `CU-CAT-30`, `CU-CAT-33`, `CU-CAT-36`, `CU-CAT-39` y `CU-CAT-42`

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
