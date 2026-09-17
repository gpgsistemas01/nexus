# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

## Organización de los artefactos

La documentación se organiza por **familias**. Cada familia tiene un artefacto principal,
que define la intención o la regla vigente, y artefactos complementarios, que amplían una
vista concreta sin sustituirlo. Los artefactos generados son evidencia técnica de una
fuente versionada; pertenecen a una familia, pero no contienen decisiones curadas.

Cada familia tiene una carpeta propia para que su ubicación también comunique su
responsabilidad. Como rutas técnicas del repositorio, los nombres de estas carpetas se
mantienen en inglés; los títulos, el contenido y los nombres de los paquetes exportables se
presentan en español:

```text
docs/
├── architecture/  # Arquitectura, construcción y convenciones técnicas
├── data/          # Datos persistentes, acceso y permisos
├── governance/    # Criterios para mantener la documentación
├── user-manual/   # Entrada, capítulos e imágenes del manual
├── requirements/  # Entrada, requisitos, casos de uso e imágenes
├── styles/        # Estilos y plantillas de publicación
├── testing/       # Estrategia, cobertura y plan de pruebas CRUD
└── generated/     # Inventarios derivados; no se editan manualmente
```

| Familia | Artefacto principal | Artefactos complementarios | Evidencia generada |
| --- | --- | --- | --- |
| Arquitectura y construcción | [Índice de arquitectura y construcción](architecture/index.md) | [Descripción de arquitectura](architecture/architecture-and-web-views/index.md), [contrato API](architecture/api-contract/index.md), [especificación OpenAPI](architecture/openapi/openapi.json), [navegación y catálogo web](architecture/web-navigation-and-screen-catalog/index.md), [guía técnica común](architecture/technical-code-documentation/index.md), referencias de [backend](architecture/backend-technical-documentation/index.md) y [frontend](architecture/frontend-technical-documentation/index.md), secuencias de ejecución por caso del [backend](architecture/backend-code-sequences/index.md) y [frontend](architecture/frontend-code-sequences/index.md), [decisiones](architecture/decisions/index.md), [diagramas vigentes del código](architecture/code-diagrams/index.md), [inventario de diagramas](architecture/diagram-inventory/index.md), [trazabilidad técnica](architecture/traceability-matrix/index.md), [patrones aplicados](architecture/design-and-construction-patterns/index.md), [estándar de codificación](architecture/coding-standards/index.md) y [convenciones de diagramas](architecture/diagram-conventions/index.md) | [Mapa del código](generated/code-map.md), derivado de rutas e importaciones de `src` |
| Dominio y requisitos | [Índice y portada del paquete](requirements/index.md); la [especificación](requirements/requirements-specification/index.md) es la fuente normativa | [Visión y alcance](requirements/vision-scope-and-requirements/index.md), [dominio y casos de uso](requirements/domain-and-use-cases/index.md), [catálogo de casos de uso](requirements/use-cases/index.md), [matriz de operaciones](requirements/requirements-operations-matrix.md), [diagramas de requisitos](requirements/diagrams/index.md) y [glosario](requirements/business-glossary.md) | No aplica; el estado funcional requiere revisión humana |
| Datos, acceso y operación | [Mapa de datos, persistencia y acceso](data/index.md) | [Análisis de usuarios y permisos](data/database-users-and-permissions-analysis.md) y [roles PostgreSQL](data/postgresql-runtime-and-migration-roles.md) | [Esquema de base de datos](generated/database-schema.md) y [diccionario técnico](generated/data-dictionary.md), derivados de `prisma/schema.prisma` |
| Pruebas | [Estrategia de pruebas](testing/service-test-coverage.md) | [Plan de pruebas](testing/test-plan.md), [ambiente, estrategia y catálogo unitario](testing/unit-test-catalog.md), y [resultados unitarios](testing/unit-test-results.md) de la última ejecución verificada | La evidencia ejecutable vive en `tests`; el catálogo y el resumen versionado complementan la salida de Vitest/CI |
| Gobierno documental | [Normas y criterios](governance/documentation-standards/index.md) | [Buenas prácticas de organización](governance/documentation-practices/index.md), [revisión de estructura](governance/non-use-case-document-review/index.md), [registro de aplicación de normas](governance/standards-application/index.md) y [convenciones de diagramas](architecture/diagram-conventions/index.md), compartidas también con arquitectura | No aplica |

La [guía de publicación y versionado](governance/publication-and-versioning/index.md) define
portadas, formatos, idioma, capturas, paquetes exportables y la relación entre las
versiones del sistema y del documento. `requirements/index.md` es la entrada del paquete de requisitos. Los manuales se publican
exclusivamente por actor desde `user-manual/actors/`; comparten
`user-manual/overview.md` y `user-manual/procedures.md`, mientras
[`user-manual/cases/`](user-manual/cases/index.md) organiza cada recorrido en un archivo `CAP-*` dentro de su área. Cada entrada
conserva su propia portada y selección de casos. No se mantiene un manual general que mezcle recorridos y permisos.

El manual incluye una [matriz de validación y modos de formulario](user-manual/form-validation-matrix.md)
como referencia operativa exportable. La matriz de operaciones de requisitos sigue siendo la
fuente normativa de capacidades y permisos; ambas matrices responden preguntas distintas.

Un artefacto puede apoyar más de una familia, pero conserva una sola responsabilidad. Por
ejemplo, las convenciones de diagramas gobiernan la notación y no reemplazan los diagramas
de arquitectura o requisitos. Del mismo modo, el esquema y el diccionario pertenecen a la
familia de datos: complementan el análisis curado, mientras Prisma conserva la fuente
técnica de modelos, campos y relaciones.

### Tipos de mantenimiento

| Tipo | Ubicación | Fuente de verdad | Forma de actualización |
| --- | --- | --- | --- |
| Curado | `docs/{architecture,data,governance,requirements,testing}/*.md` | Decisiones, requisitos y comportamiento revisado | Se edita junto con el cambio que altera su contenido. |
| Generado | `docs/generated/*.md` | `src` o `prisma/schema.prisma`, según la familia indicada arriba | `npm run docs:architecture`; no se edita manualmente. |
| Ejecutable | `tests` | Casos automatizados y datos de prueba | Sigue la ubicación y las estrategias definidas por la familia de pruebas. |
| Operativo | `README.md`, configuración y scripts | Código y configuración versionados | Se actualiza cuando cambia la instalación, ejecución o automatización. |

## Regla de actualización

La [matriz de criterios para actualizar documentación y sistema](governance/documentation-practices/08-criterios-para-actualizar-documentacion-y-sistema.md)
determina si un hallazgo exige modificar sólo documentación, sólo implementación o ambas.
Las reglas siguientes indican cómo validar el resultado una vez clasificado:

1. Cambios en routers, imports o Prisma: ejecutar `npm run docs:architecture`.
2. Cambios de diseño, comportamiento o decisiones: editar el documento curado
   correspondiente.
3. Antes de enviar un cambio: ejecutar `npm run docs:check`. CI valida la solicitud de
   cambio y, después de fusionarla, regenera y versiona el mapa de código, el esquema de
   base de datos y el diccionario técnico en `main` si fuera necesario.
4. Antes de publicar: validar el paquete con
   `npm run docs:export -- <paquete> --check`; generar DOCX o PDF sólo en desarrollo/CI.
   Las capturas se actualizan mediante `npm run docs:screenshots` con un
   entorno y una sesión de prueba preparados.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.

## Exportación y capturas

La preparación de herramientas, validación, capturas y comandos de publicación se mantiene en la
[guía de exportación documental](governance/document-export-guide/index.md).
