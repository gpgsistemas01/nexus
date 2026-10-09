# Vista de desarrollo

## Propósito y alcance

Esta vista explica **cómo se organiza y construye el software de Nexus**: módulos,
responsabilidades, dependencias, contratos internos y mecanismos que permiten extender
un recurso sin duplicar su implementación. La unidad de explicación es una colaboración
cohesiva, no una ficha por cada archivo.

Se lee desde la estructura hasta la evidencia: primero se localiza el módulo, después
se identifica la solución compartida y finalmente se revisan su configuración, sus
consumidores y sus pruebas. Los recorridos temporales de cada `CU-*` pertenecen a la
[vista de procesos](../processes/index.md); el contexto y despliegue, a la
[vista física](../physical/index.md); las capacidades y su trazabilidad, a la
[vista lógica](../logical/index.md).

## Contenido y recorrido de lectura

| Pregunta de desarrollo | Fuente propietaria | Qué aporta |
| --- | --- | --- |
| ¿Dónde está una responsabilidad y de qué depende? | [Estructura del código](code-structure/index.md) | Organización por dominio y capa, fronteras HTTP y dependencias internas. |
| ¿Cómo se integra Prisma y qué cubre una transacción? | [Prisma y persistencia](code-structure/06-prisma-and-persistence.md) | Cliente generado, conexión, consultas en servicios, `tx`, migraciones y errores. |
| ¿Qué solución compartida se aplica y cómo se configura? | [Patrones de diseño y construcción](design-and-construction-patterns/index.md) | Implementación, consumidores concretos, contratos, variantes y límites de cada mecanismo. |
| ¿Qué se reutiliza y cómo se revisa una extracción? | [Reutilización](reuse-and-refactoring/index.md) y [refactorización](reuse-and-refactoring/04-refactoring-and-extension.md) | Puntos de extensión, ownership e impacto de cambios sobre piezas comunes y consumidores. |
| ¿Qué reglas, efectos y errores conserva el servidor? | [Referencia técnica de backend](backend-technical-documentation/index.md) | Contratos y mapas de código por cada módulo; dependencias compartidas. |
| ¿Cómo se compone la pantalla y se adapta su contrato? | [Referencia técnica de frontend](frontend-technical-documentation/index.md) | Mapas de cada módulo, composición, callbacks, adaptación de datos y transporte. |
| ¿Qué rutas, imports y símbolos existen? | [Mapa generado del código](code-map.md) | Inventario enumerable desde `src`; evidencia para contrastar la explicación curada. |

## Organización de archivos

```text
development/
├── code-structure/                  # Repositorio, backend, frontend y Prisma
├── reuse-and-refactoring/           # Backend, application/requests, interfaz y extensión
├── design-and-construction-patterns/# Decisiones y mecanismos, en orden de construcción
├── backend-technical-documentation/ # Contratos por capacidad y colaboraciones técnicas
├── frontend-technical-documentation/# Contratos por pantalla y estado local
└── code-map.md                      # Inventario generado de rutas, imports y símbolos
```

Primero se consulta estructura, después el mecanismo de reutilización o patrón y, para
un recurso concreto, su referencia técnica. Las referencias agrupan contratos; los
mapas agrupan módulos. Cada carpeta tiene un `index.md` y capítulos consecutivos.

## Forma de leer los diagramas

Esta vista mantiene mapas de módulos, imports, configuración y contratos de código.
Las secuencias, actividades y máquinas de estado se mantienen en la vista de procesos.
Los flujos de datos aquí muestran adaptación de representaciones, no pasos del actor. Cada figura declara su
pregunta, alcance y fuente técnica. Una flecha de dependencia no significa que dos
módulos se ejecuten en ese orden, ni que sean unidades desplegables independientes.

Para revisar un cambio se sigue **responsabilidad → pieza compartida → configurador del
recurso → contrato observable → pruebas**. Una operación nueva que conserva el contrato
se configura en el mecanismo existente; una regla exclusiva permanece en su dominio.
El historial de una refactorización se consulta en Git, mientras esta vista describe
el resultado vigente y los criterios para mantenerlo.
