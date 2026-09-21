# Descripción de arquitectura y construcción

Este documento describe las vistas arquitectónicas del sistema y las decisiones de
organización del código. Los diagramas usan **Mermaid**, por lo que GitHub los
renderiza directamente sin guardar imágenes que puedan quedar desactualizadas.

Es el núcleo descriptivo del [documento de arquitectura](../index.md). Los casos de uso
no se redefinen aquí: pertenecen a la [SRS](../../requirements/requirements-specification/index.md)
y a sus [fichas normativas](../../requirements/use-cases/index.md). Esta descripción toma
sus identificadores como entrada y documenta contexto técnico, contenedores, componentes,
despliegue y recorridos de realización.

Dentro de la familia, esta descripción se relaciona con tres niveles de detalle:

- este documento **curado** explica contexto, decisiones, responsabilidades y flujos;
- los [diagramas vigentes del código](../code-diagrams/index.md) profundizan de forma ordenada en
  superficie HTTP, dominios, dinámica y reutilización sin repetir contexto ni
  contenedores;
- el [mapa generado del código](../../generated/code-map.md), que pertenece a la familia de
  arquitectura, mantiene un inventario de rutas y dependencias reales entre áreas.

Los otros dos artefactos generados no son anexos de este documento: el
[esquema de base de datos](../../generated/database-schema.md) y el
[diccionario técnico](../../generated/data-dictionary.md) pertenecen a la familia de datos y
se derivan de Prisma. El [índice documental](../../README.md#organización-de-los-artefactos)
expone la jerarquía completa. Los tres se verifican con `npm run docs:check`.

Así, un generador no intenta adivinar el porqué del diseño y los inventarios mecánicos
no dependen de que alguien recuerde actualizar una tabla a mano.

La navegación entre vistas sigue **Viewpoint/View con revelado progresivo**: este
documento conserva contexto y contenedores; los diagramas del código continúan con
estructura, dinámica y reutilización; el mapa generado aporta el inventario mecánico.
Cada pregunta arquitectónica tiene una vista canónica y los demás documentos la enlazan
en lugar de redibujarla.

## Capítulos

1. [1. Mantenimiento y fuentes](01-maintenance-and-sources.md)
2. [2. Arquitectura del sistema](02-architecture-of-the-system.md)
3. [3. Vistas web relacionadas](03-views-web-related.md)
4. [4. Organización consistente de front y back](04-organization-consistent-of-frontend-and-back.md)
5. [5. Modelo de vistas de arquitectura aplicado](05-model-of-views-of-architecture-applied.md)
6. [6. Herramientas](06-tools.md)
