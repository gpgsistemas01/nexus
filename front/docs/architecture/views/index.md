# Vistas arquitectónicas

La organización 4+1 mantiene una fuente por preocupación y enlaza requisitos,
realización y pruebas. Una vista puede usar varias notaciones si responden preguntas
complementarias. La [vista general](overview.md) contiene el contexto y el corte de componentes.

| Vista | Pregunta | Artefactos |
| --- | --- | --- |
| [Escenarios (+1)](scenarios/index.md) | ¿Qué objetivo se realiza y cómo se llega a él? | Catálogo de pantallas, navegación y casos de uso. |
| [Lógica](logical/index.md) | ¿Qué componentes y estados colaboran? | UI/HTTP, propiedad de datos, sesión y seguridad de entradas. |
| [Procesos](processes/index.md) | ¿En qué orden se coordina una operación? | Secuencias de arranque, lectura, guardado y documentos. |
| [Desarrollo](development/index.md) | ¿Dónde vive el código y cómo se reutiliza? | Estructura, patrones, guías de módulo y referencia generada. |
| [Física](physical/index.md) | ¿Dónde se ejecuta y qué configuración necesita? | Vite, alojamiento estático, proxy, build e imagen final. |

## Notación y relaciones

- Los mapas `flowchart` de componentes muestran consumo/dependencia, según su leyenda;
  no afirman notación UML de clases ni orden de ejecución.
- Las secuencias tienen participantes, mensajes numerados, respuestas y fragmentos
  `alt`/`opt` cuando existe una decisión real.
- Los estados describen estados observables del coordinador; el fin del diagrama
  representa su terminación, no una respuesta de red cualquiera.
- Los cortes C4 representados con cajas Mermaid declaran su nivel y alcance; el
  contenedor de software no equivale necesariamente a una imagen Docker.
- Los flujos de navegación expresan destinos; no crean relaciones UML include/extend.

Las reglas de construcción y los contratos HTTP se consultan desde varias vistas y
permanecen en [estándar](../coding-standards/index.md) y [contratos](../contracts/index.md).

## Trazabilidad de las figuras entre vistas

| Preocupación | Figura y detalle |
| --- | --- |
| Objetivos del actor (+1) | [Casos de uso por recurso](scenarios/use-case-model/index.md), con actores y límite Nexus; [pantallas](scenarios/navigation-and-screens.md) enlaza sus entradas. |
| Responsabilidades (lógica) | [Cortes de siete dominios](logical/components/index.md), [interfaces de documentos](logical/document-contracts.md), [estados de documento/captura](logical/document-states.md). |
| Orden y recuperación (procesos) | [Índice de secuencias](processes/index.md), con operación, CU y figura; [actividad de merma](processes/25-waste-preview.md) detalla el cálculo de preview. |
| Construcción (desarrollo) | [Patrones generales y aplicados](development/design-and-construction-patterns/index.md), [referencias breves por módulo](development/frontend-technical-documentation/index.md) y [código generado](development/code-reference.md). |
| Ejecución (física) | [Topología local y frontera del build](physical/runtime-and-build.md), complementada por configuración de alojamiento/proxy. |

Una secuencia de corrección no sustituye un diagrama de estados, y un corte de
componentes no explica el orden de sus mensajes. Los enlaces entre vistas permiten
leer esos aspectos sin repetir la fuente de cada figura.
