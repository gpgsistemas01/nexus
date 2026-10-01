# Vista de escenarios

## Contenido

La vista de escenarios conecta los objetivos del actor con los recorridos visibles que
condicionan la arquitectura. La definición normativa permanece en requisitos, pero su
diagrama canónico forma la vista de escenarios (+1) y se incluye por referencia, sin
mantener una copia dentro de `architecture/`:

1. [Diagrama de casos de uso vigentes](../../../requirements/domain-and-use-cases/02-current-use-cases.md):
   actores, límite de Nexus y objetivos que condicionan las demás vistas.
2. [Navegación y catálogo de pantallas web](web-navigation-and-screen-catalog/index.md):
   acceso, navegación por actor, destinos y redirecciones.
3. [Vista de componentes](../logical/01-components-and-reuse.md): correspondencia entre
   objetivos, interfaces y realización; las secuencias conservan el mismo `CU-*`.

Las [fichas](../../../requirements/use-cases/index.md) conservan el comportamiento
funcional actor–sistema. La exportación de esta vista incorpora el diagrama de casos de
uso canónico, no un segundo flujo gráfico por cada ficha ni otra versión de sus
asociaciones. Las actividades técnicas selectivas pertenecen a la
[vista de procesos](../processes/index.md).
