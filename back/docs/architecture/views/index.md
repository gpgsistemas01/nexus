# Vistas arquitectónicas

## Organización 4+1

El [documento de arquitectura](../index.md) es la entrada del conjunto. Esta carpeta
organiza sus representaciones mediante la adaptación 4+1 de Nexus: una vista responde
una pregunta arquitectónica y enlaza los artefactos que la contestan.

| Vista | Pregunta | Entrada |
| --- | --- | --- |
| [Escenarios (+1)](scenarios/index.md) | ¿Qué objetivo del actor condiciona la solución y cómo navega por ella? | Diagrama canónico de casos de uso, navegación web y trazabilidad. |
| [Lógica](logical/index.md) | ¿Qué dominios, componentes, estados y datos colaboran? | Componentes, relaciones y persistencia. |
| [Procesos](processes/index.md) | ¿En qué orden ocurre una colaboración y dónde se toman decisiones? | Recorrido general, secuencias y vistas dinámicas. |
| [Desarrollo](development/index.md) | ¿Cómo se organiza, implementa y reutiliza el código? | Referencias técnicas, diagramas, patrones y mapa generado. |
| [Física](physical/index.md) | ¿Dónde se ejecuta y despliega la solución? | Contexto, contenedores e infraestructura. |

## Artefactos de apoyo fuera de las vistas

No todo documento de arquitectura es una vista. Las referencias y reglas transversales
permanecen fuera de `views/` porque se consultan desde varias perspectivas:

- [Contrato de la API](../openapi/api-contract.md) y [OpenAPI](../openapi/openapi.json):
  interfaz HTTP compartida por escenarios, procesos y desarrollo.
- [Componentes y reutilización](logical/01-components-and-reuse.md): correspondencia
  estructural entre capacidades, interfaces y realización técnica.
- [Estándar de codificación](../coding-standards/index.md): reglas de construcción del
  código, no descripción de la solución.

Así, `views/` contiene todo artefacto cuyo propósito principal es representar el sistema;
la raíz de `architecture/` conserva las referencias, correspondencias y estándares que
apoyan varias vistas sin pertenecer a una sola.

## Notación según la pregunta del diagrama

No todas las vistas emplean UML ni todos los tipos UML usan las mismas flechas.

| Familia | Notación y criterio |
| --- | --- |
| Casos de uso | Asociaciones actor–caso, generalización e inclusión/extensión; [convención y requisito de Mermaid 12](../../requirements/domain-and-use-cases/02-current-use-cases.md). |
| Clases y dominio conceptual | `classDiagram`: asociaciones con multiplicidad y nombres o roles cuando aportan significado; generalización con triángulo hueco y composición con rombo sólido en el todo. Una asociación de clases puede llevar nombre aunque la asociación actor–caso se deje sin frase. |
| Secuencias | `sequenceDiagram`: líneas de vida, mensajes y respuestas, con fragmentos `alt`, `opt` o `loop` cuando corresponden. Los mensajes llevan nombre; no son asociaciones estructurales. |
| Actividades | [Convención de actividades](processes/index.md#notación-dinámica): acciones, flujos de control, decisiones, guardas y merge; `flowchart` es una aproximación, no soporte nativo de actividades UML. |
| Estados | `stateDiagram-v2`: estados y transiciones; la etiqueta puede expresar evento, `[guarda]` y `/ efecto`. El nodo final termina la máquina, no sólo una rama condicional. |
| Datos persistentes | ER de pata de cuervo: campos, PK/FK y cardinalidades; no se sustituye por flechas UML de generalización o dependencia. |
| Contexto, componentes C4 y despliegue | Notación de arquitectura indicada junto a la figura; una vista C4 no se declara UML por usar cajas y conexiones. |
| Navegación, dependencias y reutilización | Mapas `flowchart` con flechas cuyo significado se explica localmente; no se presentan como actividades o asociaciones UML sólo por tener pasos o relaciones. |

Una figura se conserva cuando responde una pregunta distinta de sus vistas vecinas.
Las actividades selectivas complementan las secuencias, los estados explican ciclos y
los mapas de navegación muestran destinos. No se requiere una actividad por caso ni
unificar en un solo gráfico estructura, comportamiento y datos. Las referencias entre
vistas conservan la trazabilidad sin duplicar la fuente normativa.
