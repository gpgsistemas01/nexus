# 6. Inventario de notación UML

La revisión de las vistas vigentes evita llamar UML a cualquier bloque Mermaid. No
faltan diagramas para describir el alcance actual, pero sí es necesario distinguir los
que usan notación UML de los que sólo adoptan una semántica parecida:

| Vista | Clasificación vigente | ¿Falta notación UML? |
| --- | --- | --- |
| Modelo conceptual del dominio | UML de clases (`classDiagram`), con multiplicidades, asociaciones y composiciones. | No. |
| Componentes de la aplicación | Aproximación UML de componentes mediante clases con el estereotipo `<<component>>`; Mermaid no ofrece un diagrama de componentes nativo. | Parcial; migrar a una herramienta UML sólo si se necesitan puertos e interfaces formales. |
| Recorrido de una interacción | UML de secuencia (`sequenceDiagram`), con actor, participantes y mensajes. | No. |
| Estados de acceso y estados de las salidas | UML de máquina de estados (`stateDiagram-v2`). | No. |
| Casos de uso | Aproximación UML mediante `flowchart`: clasificadores externos con estereotipo `«actor»`, grupos funcionales dentro del límite de Nexus, objetivos y asociaciones. Los grupos son ayudas visuales, no paquetes UML. | Parcial; Mermaid no ofrece casos de uso UML nativos. |
| Despliegue actual y objetivo | Grafo inspirado en despliegue UML; sus subgrafos representan entornos y nodos, pero no artefactos UML formales. | Parcial; la semántica actual es suficiente mientras no se documenten artefactos instalados. |
| Contexto, contenedores, capas, navegación, requisitos, trazabilidad y ciclo CRUD | C4 inspirado o grafos dirigidos con semántica local. | No aplica: convertirlos a UML cambiaría la pregunta que responden. |
| Esquema persistente | Entidad-relación (`erDiagram`), no UML. | No aplica: Prisma y las migraciones son la fuente técnica adecuada. |

Las aproximaciones pendientes se limitan a componentes, casos de uso y despliegue. Sólo deben
migrarse a UML estricto cuando una entrega contractual lo exija.

### Decisión sobre los diagramas de componentes

| Decisión | Criterio |
| --- | --- |
| Conservar `DIA-ARQ-CMP-001` | Muestra los componentes principales y sus dependencias. |
| No crear un diagrama por `CU-*` | Las secuencias frontend y backend ya muestran la realización concreta. |
| Agregar otra vista | Sólo cuando aparezca una frontera estable que no esté representada. |

### Enlaces entre diagramas y patrones

| Elemento | Uso |
| --- | --- |
| **Identificador**, **Pregunta** y **Patrones** | Metadatos Markdown que relacionan la vista con su propósito y patrones. |
| `FE-P*` / `BE-P*` | Código local que identifica cómo se aplica el patrón en una perspectiva. |
| `DIA-PAT-*` | Vista canónica del patrón compartido, enlazada desde el índice de la colección. |
| Mermaid | Representa participantes, relaciones y mensajes; no usa `click` ni inserta otro diagrama como nodo. |

Esta convención mantiene la navegación entre vistas sin presentar los enlaces documentales como
relaciones UML ni duplicar la explicación de cada patrón.
