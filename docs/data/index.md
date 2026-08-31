# Mapa de datos, persistencia y acceso

## Propósito

Esta página es la entrada única a la documentación relacionada con datos. No vuelve a
definir requisitos, decisiones de diseño ni detalles del esquema: indica qué artefacto
es propietario de cada afirmación y cómo recorrerla hasta su evidencia.

## Propiedad de la información

| Pregunta | Artefacto propietario | Evidencia o vista complementaria |
| --- | --- | --- |
| ¿Qué comportamiento o restricción debe cumplir Nexus? | [Especificación de requisitos](../requirements/requirements-specification.md) y [políticas transversales](../requirements/requirements-specification.md#45-políticas-transversales-del-negocio). | Los [casos de uso](../requirements/use-case-descriptions.md) organizan la interacción; no redefinen columnas. |
| ¿Qué significa un concepto para el negocio? | [Glosario](../requirements/business-glossary.md) y [modelo de dominio](../requirements/domain-and-use-cases.md). | El diccionario técnico enlaza estos artefactos, pero no infiere significado desde nombres de tablas. |
| ¿Cómo se separan cuenta, persona, asignación y autorización? | [Análisis de usuarios y permisos](database-users-and-permissions-analysis.md), como decisión de diseño de acceso. | `prisma/schema.prisma`, políticas del servidor y el [diagrama ER](../generated/database-schema.md) son evidencia. |
| ¿Qué estructura persistente existe? | `prisma/schema.prisma` y las migraciones de `prisma/migrations`. | El [diagrama ER](../generated/database-schema.md) y el [diccionario técnico](../generated/data-dictionary.md) se generan desde Prisma. |
| ¿Qué cuenta de PostgreSQL ejecuta la aplicación o las migraciones? | [Roles PostgreSQL](postgresql-runtime-and-migration-roles.md), como decisión operativa de infraestructura. | `DATABASE_URL`, `DIRECT_URL`, `prisma.config.ts` y `docker-entrypoint.sh` prueban el enrutamiento; el proveedor administra los privilegios reales. |
| ¿Cuál es el contrato HTTP de un dato? | [Contrato de la API](api-contract.md). | Rutas, validadores, DTO, controladores y pruebas de integración aportan evidencia mientras no exista OpenAPI. |

## Recorrido de trazabilidad

Para revisar un dato o una relación se sigue este orden, sin buscar una segunda fuente
normativa:

1. partir del `RF-*`, `RN-*` o `CU-*` que justifica el comportamiento;
2. confirmar el significado en el glosario y el modelo de dominio;
3. revisar la decisión de diseño de acceso o persistencia cuando corresponda;
4. comprobar campos, claves y relaciones en Prisma y sus migraciones;
5. usar el diccionario y el diagrama ER sólo como vistas generadas;
6. localizar ruta, validación, servicio y prueba desde la evidencia del requisito.

La obligatoriedad de una columna no sustituye una precondición del caso de uso; una
restricción Prisma no sustituye una regla de negocio; y una decisión de privilegios de
PostgreSQL no concede permisos funcionales a un usuario de Nexus.
