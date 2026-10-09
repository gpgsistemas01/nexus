# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

## Organización de los artefactos

La documentación se organiza por **familias**. Cada familia tiene un artefacto principal,
que define la intención o la regla vigente, y artefactos complementarios, que amplían una
vista concreta sin sustituirlo. Los artefactos generados son evidencia técnica de una
fuente versionada; pertenecen a una familia, pero no contienen decisiones curadas.

Cada familia tiene una carpeta propia para que su ubicación también comunique su
responsabilidad. Como rutas técnicas del repositorio, los nombres de carpetas y archivos
se mantienen en inglés; `index.md`, `README.md` y los identificadores estables como
`cu-cat-01.md` se conservan por convención. Los títulos, el contenido y los nombres de
los paquetes exportables se presentan en español:

El [índice de vistas arquitectónicas](architecture/views/index.md) organiza bajo
`architecture/views/` las cinco perspectivas de la adaptación 4+1 de Nexus: escenarios,
lógica, procesos, desarrollo y física. Cada subcarpeta contiene los artefactos cuyo
propósito principal es representar el sistema desde esa perspectiva. El contrato API se
mantiene junto a OpenAPI; el estándar de codificación permanece en `architecture/` como
regla de construcción transversal. Las normas para mantener y publicar documentos
permanecen en `governance/`. Una subcarpeta
`generated/` indica la forma de mantenimiento, no una vista adicional.

Cada colección de capítulos curados conserva un `index.md` sin numerar y usa prefijos
consecutivos `01-`, `02-`, etc. Las referencias generadas mantienen nombres descriptivos
estables porque se regeneran y no forman parte de la secuencia editorial.

```text
docs/
├── architecture/  # Arquitectura y construcción
│   ├── views/        # Escenarios, lógica, procesos, desarrollo y física
│   └── openapi/      # Referencia HTTP y contrato procesable
├── governance/    # Criterios transversales para mantener la documentación
├── user-manual/   # Entrada, capítulos e imágenes del manual
├── requirements/  # Entrada, requisitos, casos de uso e imágenes
├── styles/        # Estilos y plantillas de publicación
└── testing/       # Estrategia, cobertura y plan de pruebas CRUD
```

| Familia | Artefacto principal | Artefactos complementarios | Evidencia generada |
| --- | --- | --- | --- |
| Arquitectura, construcción y datos | [Documento de arquitectura y construcción](architecture/index.md) | [Descripción de arquitectura](architecture/views/index.md), [modelo persistente](architecture/views/logical/data-and-persistence/index.md), [contrato API](architecture/openapi/api-contract.md), [navegación web](architecture/views/scenarios/web-navigation-and-screen-catalog/index.md), referencias de [backend](architecture/views/development/backend-technical-documentation/index.md) y [frontend](architecture/views/development/frontend-technical-documentation/index.md), [secuencias](architecture/views/processes/backend-code-sequences/index.md), [estructura del código](architecture/views/development/code-structure/index.md) y [reutilización](architecture/views/development/reuse-and-refactoring/index.md) y [patrones](architecture/views/development/design-and-construction-patterns/index.md) | [Mapa del código](architecture/views/development/code-map.md), [esquema de base de datos](architecture/views/logical/data-and-persistence/generated/database-schema.md) y [diccionario técnico](architecture/views/logical/data-and-persistence/generated/data-dictionary.md) |
| Dominio y requisitos | [Índice y portada del paquete](requirements/index.md); la [SRS](requirements/requirements-specification/index.md) y las [fichas de casos de uso](requirements/use-cases/index.md) son las fuentes normativas complementarias | [Visión y alcance](requirements/vision-scope-and-requirements/index.md), [dominio y casos de uso](requirements/domain-and-use-cases/index.md) y [glosario](requirements/business-glossary.md) | No aplica; el estado funcional requiere revisión humana |
| Pruebas | [Plan de pruebas](testing/test-plan.md) | [Registro selectivo de casos automatizados](testing/automated-test-case-index.md) y [cobertura relevante por caso de uso](testing/use-case-test-types.md) | La implementación ejecutable vive en `tests`; CI conserva el resultado de cada ejecución sin versionar resultados que queden obsoletos |
| Gobierno documental | [Normas y criterios](governance/documentation-standards/index.md) | [Registro de aplicación de normas](governance/standards-application/index.md) | No aplica |

La [guía de publicación y versionado](governance/publication-and-versioning/index.md) define
portadas, formatos, idioma, capturas, paquetes exportables y la relación entre las
versiones del sistema y del documento. `requirements/index.md` es la entrada del paquete de requisitos. Los manuales se publican
exclusivamente por actor desde `user-manual/actors/`; comparten
`user-manual/overview.md` y `user-manual/procedures.md`, mientras
[`user-manual/cases/`](user-manual/cases/index.md) organiza cada recorrido en un archivo `CAP-*` dentro de su área. Cada entrada
conserva su propia portada y selección de casos. No se mantiene un manual general que mezcle recorridos y permisos.

El manual incluye una [matriz de validación y modos de formulario](user-manual/form-validation-matrix.md)
como referencia operativa exportable. Los modos y efectos normativos permanecen en la
[SRS](requirements/requirements-specification/06-operation-modes-and-effects.md); las
interfaces y autorizaciones técnicas se verifican en arquitectura, OpenAPI y el servidor.

Un artefacto puede apoyar más de una familia, pero conserva una sola responsabilidad.
Los diagramas se mantienen junto a la vista o regla que explican, en lugar de repetir
su ubicación en un inventario manual. Del mismo modo, el esquema y el diccionario pertenecen a la
vista arquitectónica de datos: complementan el análisis curado, mientras Prisma conserva
la fuente técnica de modelos, campos y relaciones. El paquete exportable de datos es una
selección de esa vista y no una familia documental independiente.

### Límite entre visión, SRS y arquitectura

| Documento | Pregunta que responde | Contenido propietario | Lo que sólo referencia |
| --- | --- | --- | --- |
| [Visión y alcance](requirements/vision-scope-and-requirements/index.md) | ¿Por qué existe Nexus, para quién y qué queda dentro o fuera? | Problema, objetivos, interesados, contexto, alcance y capacidades de alto nivel. | Requisitos detallados, pasos de interacción y solución técnica. |
| [SRS](requirements/requirements-specification/index.md) y [casos de uso](requirements/use-cases/index.md) | ¿Qué debe hacer Nexus y bajo qué reglas verificables? | Requisitos funcionales y de calidad; actores, precondiciones, flujos y postcondiciones de cada `CU-*`. | Componentes, capas, endpoints y secuencias internas que realizan el comportamiento. |
| [Documento de arquitectura](architecture/index.md) | ¿Cómo está estructurada la solución y cómo satisface los requisitos? | Contexto técnico, contenedores, componentes, despliegue, decisiones, contratos y realización técnica trazable. | Objetivos de negocio y flujos normativos definidos por la SRS. |

Por tanto, un **caso de uso pertenece a requisitos**, aunque arquitectura reutilice su
identificador para explicar su realización. Los diagramas de secuencia de frontend o
backend no son una segunda descripción del caso: muestran cómo colaboran las piezas de
la solución para satisfacerlo. Esta separación permite cambiar una decisión técnica sin
reescribir el objetivo del actor y cambiar un requisito obligando a revisar su impacto
arquitectónico mediante los identificadores compartidos por componentes, secuencias y pruebas.

### Tipos de mantenimiento

| Tipo | Ubicación | Fuente de verdad | Forma de actualización |
| --- | --- | --- | --- |
| Curado | `docs/{architecture,governance,requirements,testing}/*.md` | Decisiones, requisitos y comportamiento revisado | Se edita junto con el cambio que altera su contenido. |
| Generado | `docs/architecture/views/development/code-map.md` y `docs/architecture/views/logical/data-and-persistence/generated/*.md` | `src` o `prisma/schema.prisma`, según la preocupación propietaria indicada arriba | `npm run docs:architecture`; no se edita manualmente. |
| Ejecutable | `tests` | Casos automatizados y datos de prueba | Sigue la ubicación y las estrategias definidas por la familia de pruebas. |
| Operativo | `README.md`, configuración y scripts | Código y configuración versionados | Se actualiza cuando cambia la instalación, ejecución o automatización. |

## Regla de actualización

Las [convenciones mínimas adoptadas](governance/documentation-standards/04-conventions-minimum-adopted.md)
distinguen los artefactos curados de las evidencias generadas. Para validar una modificación:

1. Cambios en routers, imports o Prisma: ejecutar `npm run docs:architecture`.
2. Cambios de diseño, comportamiento o decisiones: editar el documento curado
   correspondiente.
3. Antes de enviar un cambio: ejecutar `npm run docs:check`. CI valida la solicitud de
   cambio y, después de fusionarla, regenera y versiona el mapa de código, el esquema de
   base de datos y el diccionario técnico en `main` si fuera necesario.
4. Antes de publicar: validar el paquete con
   `npm run docs:export -- <paquete> [seccion] --check`; generar DOCX o PDF sólo en desarrollo/CI.
   Las capturas se actualizan mediante `npm run docs:screenshots` con un
   entorno y una sesión de prueba preparados.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.

## Exportación y capturas

La preparación de herramientas, validación, capturas y comandos de publicación se mantiene en la
[guía de exportación documental](governance/document-export-guide/index.md).
