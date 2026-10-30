# Documentación del frontend Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.9 | 1.0.0 | En revisión | 2026-10-29 | Equipo Nexus |

## Propósito y audiencia

Esta colección describe requisitos, casos de uso, arquitectura, construcción, pruebas
y operación del cliente Vue de Nexus. Desarrollo mantiene las fuentes; la revisión
técnica contrasta código, contratos y evidencia. La aceptación se registra con su
responsable y resultados; el estado de estas guías permanece En revisión.

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

| Colección | Contenido propietario | Lectura inicial |
| --- | --- | --- |
| [Requisitos](requirements/index.md) | Visión, alcance, obligaciones, actores, estados y 94 fichas de caso de uso. | Especificación y familia funcional afectada. |
| [Arquitectura](architecture/index.md) | Vistas 4+1, decisiones, interfaces, realización y patrones. | Vista general y preocupación del cambio. |
| [Estándar de código](architecture/coding-standards/index.md) | Nueve capítulos de formato, nombres, dependencias, SFC, datos, errores y comentarios. | Capítulo correspondiente. |
| [Estándares por ámbito](governance/09-standards-and-ownership.md) | Reglas de interfaz, seguridad, pruebas, documentación y diagramación en sus fuentes propias. | Mapa de estándares. |
| [Entorno y flujo de trabajo](development/index.md) | Instalación, archivos locales, arranque, herramientas y despliegue. | Inicio local. |
| [Pruebas](testing/index.md) | Plan, diseños DP, fichas CP, matriz por CU y ejecución de sistema. | Plan y casos del riesgo afectado. |
| [Gobierno](governance/index.md) | Reglas editoriales, responsables, referencias y generación. | Reglas y publicación. |
| [Manual de usuario](user-manual/index.md) | Operación de las pantallas Vue, campos, resultados y recuperación. | Ingreso y tarea del operador. |

## Recorridos de lectura

| Necesidad | Recorrido |
| --- | --- |
| Operar el sistema | [Manual de usuario](user-manual/index.md) → procedimiento del módulo → reportes o recuperación. |
| Generar la inducción por cuenta | [Guía completa de generación](governance/07-manual-accounts-and-files.md): preparación, credenciales, capturas, publicación y recuperación. |
| Incorporarse al proyecto | [Inicio local](development/01-getting-started.md) → [guía del código](architecture/views/development/developer-onboarding.md) → [vista general](architecture/views/overview.md). |
| Implementar una operación | [Requisito y CU](requirements/index.md) → [componentes](architecture/views/logical/components/index.md) → [contratos](architecture/contracts/index.md) → [secuencia](architecture/views/processes/index.md) → [estándar](architecture/coding-standards/index.md). |
| Leer un diagrama | [Guía visual](architecture/views/diagram-reading.md) → leyenda local → fuentes de la figura. |
| Interpretar términos documentales | [Vocabulario de requisitos y documentación](governance/08-documentation-vocabulary.md); los conceptos operativos están en el glosario de negocio. |
| Revisar datos o errores | [Contrato del cliente](architecture/contracts/index.md) → [mappers/servicios](architecture/views/development/code-reference.md) → [pruebas de la condición](testing/02-test-design.md). |
| Diseñar o ejecutar pruebas | [Plan](testing/01-test-plan.md) → [diseño DP](testing/02-test-design.md) → [caso CP](testing/03-test-cases.md) → evidencia EP de la corrida. |
| Preparar la primera ejecución de pruebas | [Archivos, credenciales y comandos](testing/06-test-files-and-credentials.md) → suite del nivel elegido → revisión de resultados. |
| Construir o desplegar | [Guía de operación](development/03-build-and-deployment.md) y [topología](architecture/views/physical/index.md). |
| Mantener documentación | [Reglas editoriales](governance/01-documentation-rules.md) → [catálogo de publicación](publications.json) → [validación/exportación](governance/02-generation-and-publication.md). |

Las rutas de lectura siguen la tarea del lector. Las carpetas identifican al propietario
del contenido; una referencia a otra colección enlaza su explicación sin duplicarla.

## Trazabilidad

La cadena de lectura es requisito → caso de uso → realización/contrato → diseño DP →
caso CP o prueba ejecutable → evidencia EP. Los casos de uso conservan un archivo por
objetivo, con tabla completa y pasos actor–Nexus. Los diseños, casos y ejecuciones de
prueba usan registros separados. La [matriz](testing/04-use-case-coverage.md) declara
condiciones representadas y límites de las pruebas con API simulada.

Los diagramas de patrón permanecen junto a su explicación, con modelo general y
aplicación concreta. Las secuencias de procesos identifican orden, rechazo y resultado;
las vistas de estructura identifican responsabilidades y dependencias.

## Mantenimiento y publicación

El [procedimiento de publicación](governance/02-generation-and-publication.md) distingue
fuentes curadas, referencia generada y artefactos. El catálogo [publications.json](publications.json)
define documentos temáticos y el orden de lectura de la publicación completa. Se
comprueba que cada fuente Markdown tenga ubicación en ese catálogo.

Los comandos, herramientas, secciones y rutas de resultados se mantienen en la
[guía de publicación](governance/02-generation-and-publication.md). El manual tiene
publicación independiente; su generación por cuenta se explica en la
[guía de credenciales y ejecución](governance/07-manual-accounts-and-files.md).

Las [reglas y recomendaciones](governance/04-conventions-and-criteria.md) distinguen
obligaciones del proyecto, decisiones y evidencia de aceptación.
