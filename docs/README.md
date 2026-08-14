# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

| Tema | Documento | Mantenimiento |
| --- | --- | --- |
| Arquitectura, navegación y organización del código | [Arquitectura y vistas web](architecture-and-web-views.md) | Curado al cambiar el diseño. |
| Dependencias entre áreas y rutas registradas | [Mapa generado del código](generated/code-map.md) | `npm run docs:architecture`; verificado por CI. |
| Modelo de datos y relaciones por área | [Diagramas de base de datos](generated/database-schema.md) | Generado desde Prisma; verificado en PR y regenerado al entrar a `main`. |
| Requisitos funcionales, reglas y criterios de aceptación | [Especificación de requisitos](requirements-specification.md) | Fuente curada de alcance y estado funcional. |
| Vista visual de requisitos y trazabilidad | [Diagramas de requisitos](requirements-diagrams.md) | Curado junto con la especificación. |
| Contrato de la API y evaluación de Swagger/OpenAPI | [Contrato API](api-contract.md) | Actualizar al cambiar la estrategia de la API. |
| Estrategia y ubicación de pruebas | [Estrategia de pruebas](service-test-coverage.md) | Curado al cambiar la estrategia. |
| Usuarios, personas, auditoría y permisos | [Análisis de usuarios y permisos](database-users-and-permissions-analysis.md) | Curado al cambiar el modelo o la autorización. |
| Roles PostgreSQL de ejecución y migración | [Roles PostgreSQL](postgresql-runtime-and-migration-roles.md) | Curado al cambiar el despliegue o los privilegios. |

## Regla de actualización

1. Cambios en routers, imports o Prisma: ejecutar `npm run docs:architecture`.
2. Cambios de diseño, comportamiento o decisiones: editar el documento curado
   correspondiente.
3. Antes de enviar un cambio: ejecutar `npm run docs:check`. CI valida el pull request
   y, después de fusionarlo, regenera y versiona los diagramas derivados en `main` si
   fuera necesario.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.
