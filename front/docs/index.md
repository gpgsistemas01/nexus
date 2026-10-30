# Documentación del frontend Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.9 | 1.0.0 | En revisión | 2026-10-29 | Equipo Nexus |

## Propósito y audiencia

Esta colección explica requisitos, arquitectura, construcción, pruebas y operación
del cliente Vue. Está dirigida a desarrollo, pruebas y usuarios del sistema.

Nexus administra inventario, compras, solicitudes de salida, surtido, devoluciones y
sus movimientos. El cliente Vue presenta estos procesos y consume la API del sistema.
La [guía de incorporación](architecture/views/development/developer-onboarding.md)
explica el dominio, el vocabulario técnico y un recorrido de código para quien empieza.

## Organización y fuentes propietarias

```text
front/docs/
├── index.md
├── publications.json                # Alcance y orden de los documentos exportados
├── requirements/
│   ├── vision-scope-and-requirements/ # Necesidad, interesados y alcance
│   ├── requirements-specification/   # Reglas del producto y obligaciones del cliente
│   ├── domain-model/                 # Conceptos, relaciones y ciclos de estado
│   ├── use-case-model/               # Actores y objetivos del negocio
│   └── use-cases/                    # Fichas por objetivo y familia
├── architecture/
│   ├── coding-standards/             # Convenciones del código Vue/TypeScript
│   ├── contracts/                    # Interfaces HTTP y entre componentes
│   └── views/
│       ├── scenarios/                # Navegación y objetivos
│       ├── logical/                  # Componentes, modelos de tipos y estados
│       ├── processes/                # Secuencias agrupadas por responsabilidad
│       ├── development/              # Estructura, patrones y referencia de código
│       └── physical/                 # Ejecución y despliegue
├── development/                     # Entorno y flujo de trabajo local
├── testing/                         # Plan, diseño, casos, cobertura y sistema
├── user-manual/                     # Procedimientos y capturas para operadores
└── governance/                      # Edición, revisión y publicación
```

| Colección | Contenido propietario |
| --- | --- |
| [Requisitos](requirements/index.md) | Visión, alcance, obligaciones, actores, estados y 94 fichas de caso de uso. |
| [Arquitectura](architecture/index.md) | Vistas 4+1, decisiones, interfaces, realización y patrones. |
| [Estándar de código](architecture/coding-standards/index.md) | Nueve capítulos de formato, nombres, dependencias, SFC, datos, errores y comentarios. |
| [Estándares por ámbito](governance/09-standards-and-ownership.md) | Reglas de interfaz, seguridad, pruebas, documentación y diagramación en sus fuentes propias. |
| [Entorno y flujo de trabajo](development/index.md) | Instalación, archivos locales, arranque, herramientas y despliegue. |
| [Pruebas](testing/index.md) | Plan, diseños DP, fichas CP, matriz por CU y ejecución de sistema. |
| [Gobierno](governance/index.md) | Reglas editoriales, responsables, referencias y generación. |
| [Manual de usuario](user-manual/index.md) | Operación de las pantallas Vue, campos, resultados y recuperación. |

## Recorridos de lectura

| Necesidad | Recorrido |
| --- | --- |
| Operar el sistema | [Manual de usuario](user-manual/index.md) → procedimiento del módulo → reportes o recuperación. |
| Generar la inducción por cuenta | [Guía completa de generación](governance/07-manual-accounts-and-files.md): preparación, credenciales, capturas, publicación y recuperación. |
| Incorporarse al proyecto | [Inicio local](development/01-getting-started.md) → [guía del código](architecture/views/development/developer-onboarding.md) → [vista general](architecture/views/overview.md). |
| Localizar reglas y excepciones | [Consulta por tema](requirements/requirements-specification/index.md#consulta-rápida-de-reglas-y-excepciones) → regla → alternativas y excepciones del caso. |
| Implementar una operación | [Requisito y CU](requirements/index.md) → [componentes](architecture/views/logical/components/index.md) → [contratos](architecture/contracts/index.md) → [secuencia](architecture/views/processes/index.md) → [estándar](architecture/coding-standards/index.md). |
| Leer un diagrama | [Guía visual](architecture/views/diagram-reading.md) → leyenda local → fuentes de la figura. |
| Interpretar términos documentales | [Vocabulario de requisitos y documentación](governance/08-documentation-vocabulary.md); los conceptos operativos están en el glosario de negocio. |
| Revisar datos o errores | [Contrato del cliente](architecture/contracts/index.md) → [mappers/servicios](architecture/views/development/code-reference.md) → [pruebas de la condición](testing/02-test-design.md). |
| Diseñar o ejecutar pruebas | [Plan](testing/01-test-plan.md) → [diseño DP](testing/02-test-design.md) → [caso CP](testing/03-test-cases.md) → evidencia EP de la corrida. |
| Preparar la primera ejecución de pruebas | [Archivos, credenciales y comandos](testing/06-test-files-and-credentials.md) → suite del nivel elegido → revisión de resultados. |
| Construir o desplegar | [Guía de operación](development/03-build-and-deployment.md) y [topología](architecture/views/physical/index.md). |
| Mantener documentación | [Reglas editoriales](governance/01-documentation-rules.md) → [catálogo de publicación](publications.json) → [validación/exportación](governance/02-generation-and-publication.md). |

## Trazabilidad

La [guía de trazabilidad](requirements/01-applicability-and-traceability.md) enlaza
requisito, caso de uso, realización, diseño DP, prueba y evidencia EP. La
[matriz de cobertura](testing/04-use-case-coverage.md) indica las condiciones
comprobadas y los límites de cada nivel de prueba.
