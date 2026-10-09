# Vista de desarrollo

Esta vista explica la organización del software, la implementación de sus módulos y
las decisiones que permiten compartir código. Las secuencias y estados pertenecen a
[procesos](../processes/index.md), el despliegue a [física](../physical/index.md) y las
capacidades y trazabilidad a [lógica](../logical/index.md).

## Organización y recorrido de lectura

| Nivel | Fuente propietaria | Pregunta y contenido |
| --- | --- | --- |
| 1. Conjunto del software | [Organización e integración del código](code-structure/index.md) | ¿Cómo se distribuyen servidor, navegador y persistencia? Estructura del repositorio, registros HTTP, fronteras y Prisma. |
| 2. Implementación de un módulo | Referencias técnicas de [backend](backend-technical-documentation/index.md) y [frontend](frontend-technical-documentation/index.md) | ¿Qué archivos lo implementan? Imports, configuración, contratos y particularidades del recurso. |
| 3. Decisión compartida | [Patrones de diseño y construcción](design-and-construction-patterns/index.md) | ¿Por qué se elige esta solución? Problema, decisión, aplicación, variantes y límites. |
| 4. Mecanismo reutilizable | [Reutilización y refactorización](reuse-and-refactoring/index.md) | ¿Qué núcleo se comparte y qué configura cada consumidor? Contratos de extensión e impacto de una extracción. |
| Evidencia técnica | [Mapa generado](code-map.md) | Inventario de rutas, imports y símbolos derivado de `src`. |

Para conocer el sistema se empieza por el nivel 1. Para cambiar un módulo se entra
directamente en su referencia backend/frontend y se siguen los enlaces a Prisma,
patrones o reutilización que expliquen sus dependencias. No es necesario recorrer
primero todos los patrones para localizar el código de un recurso.

## Propiedad de la información

La carpeta `code-structure` conserva la visión general: sus mapas agrupan áreas y
fronteras. Las referencias técnicas poseen los mapas detallados por módulo y sus tablas
de archivos. Los patrones justifican una decisión que aparece en varios módulos y
referencian esos mapas; reutilización posee las figuras del núcleo y sus configuradores.
Una misma implementación tiene una fuente de detalle y enlaces desde las demás colecciones.

Por ejemplo, Catálogos se localiza en las referencias de
[backend](backend-technical-documentation/16-catalogs-code.md) y
[frontend](frontend-technical-documentation/16-catalogs-code.md). El
[patrón de registro con lista blanca](design-and-construction-patterns/08-catalog-registry-and-allowlist.md)
explica por qué comparte configuración, y la
[factory CRUD](reuse-and-refactoring/02-browser-applications-and-requests.md) explica
el núcleo reutilizado por su aplicación del navegador.

```text
development/
├── code-structure/                   # Organización general, fronteras e integración Prisma
├── backend-technical-documentation/  # Implementación y contratos de módulos del servidor
├── frontend-technical-documentation/ # Implementación y contratos de módulos del navegador
├── design-and-construction-patterns/ # Decisiones compartidas y sus límites
├── reuse-and-refactoring/            # Núcleos, configuradores y contratos de extensión
└── code-map.md                       # Evidencia generada
```

## Diagramas de desarrollo

Las figuras representan módulos, imports, configuración, composición y contratos.
Cada una declara pregunta, alcance, leyenda y fuente de código. Las flechas distinguen
import, uso, agrupación o configuración; no presuponen orden de ejecución ni unidades
de despliegue independientes. Los recorridos HTTP, reintentos, estados y límites
temporales se consultan en procesos, sin repetirlos con otras etiquetas.

Al cambiar un recurso se revisan sus archivos y contrato; al cambiar una pieza compartida,
todos sus configuradores y consumidores. El historial de una extracción pertenece a Git;
esta vista documenta el resultado vigente y su evidencia disponible.

## Criterio de índices

El índice de esta vista presenta sus colecciones; el `index.md` de cada colección
localiza sus capítulos o módulos. Un capítulo técnico desarrolla su contrato o decisión,
sin mantener otra lista equivalente de navegación. Los índices de grupos de secuencias
sirven para encontrar casos entre muchos archivos y seleccionar su paquete exportable.
Las tablas de notación, decisiones o cobertura aportan otra pregunta y sólo se conservan
cuando no reproducen esa misma lista.
