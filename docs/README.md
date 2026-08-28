# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

## Organización de los artefactos

La documentación se organiza por **familias**. Cada familia tiene un artefacto principal,
que define la intención o la regla vigente, y artefactos complementarios, que amplían una
vista concreta sin sustituirlo. Los artefactos generados son evidencia técnica de una
fuente versionada; pertenecen a una familia, pero no contienen decisiones curadas.

| Familia | Artefacto principal | Artefactos complementarios | Evidencia generada |
| --- | --- | --- | --- |
| Arquitectura y construcción | [Arquitectura y vistas web](architecture-and-web-views.md) | [Patrones aplicados](design-and-construction-patterns.md), [convenciones de controladores](controller-naming-and-imports.md) y [convenciones de diagramas](diagram-conventions.md) | [Mapa del código](generated/code-map.md), derivado de rutas e importaciones de `src` |
| Dominio y requisitos | [Especificación de requisitos](requirements-specification.md) | [Visión y alcance](vision-scope-and-requirements.md), [dominio y casos de uso](domain-and-use-cases.md), [catálogo de casos de uso](use-case-descriptions.md), [matriz de operaciones](requirements-operations-matrix.md), [diagramas de requisitos](requirements-diagrams.md) y [glosario](business-glossary.md) | No aplica; el estado funcional requiere revisión humana |
| Datos, acceso y operación | [Análisis de usuarios y permisos](database-users-and-permissions-analysis.md) | [Roles PostgreSQL](postgresql-runtime-and-migration-roles.md) y [contrato API](api-contract.md) | [Esquema de base de datos](generated/database-schema.md) y [diccionario técnico](generated/data-dictionary.md), derivados de `prisma/schema.prisma` |
| Pruebas | [Estrategia de pruebas](service-test-coverage.md) | [Plan de pruebas](test-plan.md), que concreta alcance, matriz CRUD y criterios de ejecución | No aplica; la evidencia ejecutable vive en `tests` |
| Gobierno documental | [Normas y criterios](documentation-standards.md) | [Convenciones de diagramas](diagram-conventions.md), compartidas también con arquitectura | No aplica |

Un artefacto puede apoyar más de una familia, pero conserva una sola responsabilidad. Por
ejemplo, las convenciones de diagramas gobiernan la notación y no reemplazan los diagramas
de arquitectura o requisitos. Del mismo modo, el esquema y el diccionario pertenecen a la
familia de datos: complementan el análisis curado, mientras Prisma conserva la fuente
técnica de modelos, campos y relaciones.

### Tipos de mantenimiento

| Tipo | Ubicación | Fuente de verdad | Forma de actualización |
| --- | --- | --- | --- |
| Curado | `docs/*.md` | Decisiones, requisitos y comportamiento revisado | Se edita junto con el cambio que altera su contenido. |
| Generado | `docs/generated/*.md` | `src` o `prisma/schema.prisma`, según la familia indicada arriba | `npm run docs:architecture`; no se edita manualmente. |
| Ejecutable | `tests` | Casos automatizados y datos de prueba | Sigue la ubicación y las estrategias definidas por la familia de pruebas. |
| Operativo | `README.md`, configuración y scripts | Código y configuración versionados | Se actualiza cuando cambia la instalación, ejecución o automatización. |

## Regla de actualización

1. Cambios en routers, imports o Prisma: ejecutar `npm run docs:architecture`.
2. Cambios de diseño, comportamiento o decisiones: editar el documento curado
   correspondiente.
3. Antes de enviar un cambio: ejecutar `npm run docs:check`. CI valida la solicitud de
   cambio y, después de fusionarla, regenera y versiona el mapa de código, el esquema de
   base de datos y el diccionario técnico en `main` si fuera necesario.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.
