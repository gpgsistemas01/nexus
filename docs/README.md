# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

| Tema | Documento | Mantenimiento |
| --- | --- | --- |
| Arquitectura, navegación y organización del código | [Arquitectura y vistas web](architecture-and-web-views.md) | Curado al cambiar el diseño. |
| Patrones de diseño, construcción y reutilización | [Patrones aplicados](design-and-construction-patterns.md) | Curado al cambiar factories, transacciones, eventos o composición de componentes. |
| Dependencias entre áreas y rutas registradas | [Mapa generado del código](generated/code-map.md) | `npm run docs:architecture`; verificado por CI. |
| Modelo de datos y relaciones por área | [Diagramas de base de datos](generated/database-schema.md) | Generado desde Prisma; verificado en PR y regenerado al entrar a `main`. |
| Campos, claves, tipos y relaciones persistentes | [Diccionario técnico de datos](generated/data-dictionary.md) | Generado desde Prisma con `npm run docs:architecture`; verificado por CI. |
| Conceptos de negocio, casos de uso y relación entre vistas | [Dominio y casos de uso](domain-and-use-cases.md) | Curado al cambiar objetivos de actores o significado del dominio. |
| Descripciones de casos de uso agrupadas por tema | [Catálogo de casos de uso](use-case-descriptions.md) | Curado junto con el diagrama, los requisitos y las pruebas del flujo. |
| Terminología común de usuarios y responsables | [Glosario del negocio](business-glossary.md) | Validar al definir o cambiar un requisito. |
| Visión, alcance, actores y atributos de calidad | [Visión, alcance y requisitos](vision-scope-and-requirements.md) | Curado al cambiar el alcance del producto, sus actores o restricciones de calidad. |
| Requisitos funcionales, reglas y criterios de aceptación | [Especificación de requisitos](requirements-specification.md) | Fuente curada de alcance y estado funcional. |
| Operaciones permitidas por módulo y contexto | [Matriz de operaciones](requirements-operations-matrix.md) | Curada junto con rutas, permisos, requisitos y pruebas CRUD. |
| Vista visual de requisitos y trazabilidad | [Diagramas de requisitos](requirements-diagrams.md) | Curado junto con la especificación. |
| Patrones, semántica y generación de diagramas | [Convenciones de diagramas](diagram-conventions.md) | Aplicar al crear o modificar una vista curada o generada. |
| Normas y convenciones documentales | [Criterio sobre normas](documentation-standards.md) | Reevaluar ante exigencias contractuales, regulatorias o de auditoría. |
| Contrato de la API y evaluación de Swagger/OpenAPI | [Contrato API](api-contract.md) | Actualizar al cambiar la estrategia de la API. |
| Estrategia y ubicación de pruebas | [Estrategia de pruebas](service-test-coverage.md) | Curado al cambiar la estrategia. |
| Alcance, matriz CRUD y criterios de pruebas | [Plan de pruebas](test-plan.md) | Revisar en cada cambio funcional y antes de una liberación. |
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
