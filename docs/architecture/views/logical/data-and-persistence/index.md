# Modelo persistente

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

## Vistas del modelo

1. [Diagramas entidad–relación](generated/database-schema.md): cinco vistas por área y
   relaciones transversales, generadas desde Prisma.
2. [Diccionario técnico](generated/data-dictionary.md): modelos, campos, tipos, claves y
   relaciones que complementan la lectura de los diagramas.

## Propósito

Esta página presenta la estructura de datos mediante sus vistas ER. No es una guía para
ejecutar migraciones, recuperar despliegues ni aprovisionar cuentas de base de datos. Esos
procedimientos pertenecen a la [vista física](../../physical/index.md). Tampoco redefine
reglas funcionales: Prisma es la fuente técnica y los requisitos explican el significado
de negocio.

## Propiedad de la información

| Pregunta | Artefacto propietario | Evidencia o vista complementaria |
| --- | --- | --- |
| ¿Qué comportamiento o restricción debe cumplir Nexus? | [Especificación de requisitos](../../../../requirements/requirements-specification/index.md) y [políticas transversales](../../../../requirements/requirements-specification/04-unified-catalog-by-scope/05-cross-cutting-business-policies.md#45-políticas-transversales-del-negocio). | Los [casos de uso](../../../../requirements/use-cases/index.md) organizan la interacción; no redefinen columnas. |
| ¿Qué significa un concepto para el negocio? | [Glosario](../../../../requirements/business-glossary.md) y [modelo de dominio](../../../../requirements/domain-and-use-cases/index.md). | El diccionario técnico enlaza estos artefactos, pero no infiere significado desde nombres de tablas. |
| ¿Cómo se separan cuenta, persona, asignación y autorización? | [Identidad, acceso y auditoría](../02-identity-access-and-audit.md), como decisión de diseño. | `prisma/schema.prisma`, políticas del servidor y el [diagrama ER](generated/database-schema.md) son evidencia. |
| ¿Qué estructura persistente existe? | `prisma/schema.prisma` y las migraciones de `prisma/migrations`. | El [diagrama ER](generated/database-schema.md) y el [diccionario técnico](generated/data-dictionary.md) se generan desde Prisma. |
| ¿Qué cuenta de PostgreSQL ejecuta la aplicación o las migraciones? | [Roles PostgreSQL](../../physical/02-postgresql-runtime-and-migration-roles.md), en la vista física. | `DATABASE_URL`, `DIRECT_URL`, `prisma.config.ts` y `docker-entrypoint.sh` prueban el enrutamiento; el proveedor administra los privilegios reales. |
| ¿Cuál es el contrato HTTP de un dato? | [Contrato de la API](../../../api-contract.md) y [OpenAPI 3.1](../../../openapi/openapi.json). | Rutas, validadores, DTO, controladores y pruebas de integración aportan la evidencia que debe conservarse sincronizada con el contrato procesable. |

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
