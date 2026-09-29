# Descripción de arquitectura y construcción

Entrada breve a las vistas curadas de Nexus. Los requisitos y casos de uso permanecen
en la [SRS](../../requirements/requirements-specification/index.md); aquí se representa
cómo los realizan los contenedores y componentes de la solución.

Los bloques Mermaid de estos capítulos son **código fuente curado dentro de Markdown**:
GitHub y el exportador los renderizan, pero el generador no decide su contenido. Sólo el
[mapa del código](../views/development/code-map.md), el esquema y el diccionario de datos se
derivan automáticamente con `npm run docs:architecture`.

## Capítulos

1. [1. Arquitectura del sistema](01-architecture-of-the-system.md): contexto, contenedores,
   despliegue y recorrido general.
2. [2. Componentes y reutilización](02-organization-consistent-of-frontend-and-back.md):
   responsabilidades y piezas compartidas de backend y frontend.
3. [3. Modelo de vistas aplicado](03-model-of-views-of-architecture-applied.md): criterio
   para elegir y relacionar las representaciones.

La navegación y los estados visibles tienen su propio
[catálogo de pantallas](../web-navigation-and-screen-catalog/index.md); el inventario
mecánico de rutas e imports se consulta en el mapa generado.
