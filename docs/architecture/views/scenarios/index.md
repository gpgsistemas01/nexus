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

## Trazabilidad de salidas de consumibles

Los siete objetivos tienen identidad propia, aunque compartan componentes con las
salidas de materiales. El Administrador del sistema hereda las operaciones del
Personal de almacén. La asociación con el actor parte de la consulta; la creación y
las demás acciones se ofrecen desde ella conforme al estado y los permisos.

| Escenario | Caso de uso normativo | Destino visible |
| --- | --- | --- |
| Consultar salidas | [`CU-SAL-15`](../../../requirements/use-cases/issues/cu-sal-15.md) | `/salidas/consumibles` |
| Registrar solicitud | [`CU-SAL-16`](../../../requirements/use-cases/issues/cu-sal-16.md) | `/salidas/consumibles` |
| Editar encabezado | [`CU-SAL-17`](../../../requirements/use-cases/issues/cu-sal-17.md) | `/salidas/consumibles` |
| Editar detalles pendientes | [`CU-SAL-18`](../../../requirements/use-cases/issues/cu-sal-18.md) | `/salidas/consumibles` |
| Surtir consumibles | [`CU-SAL-19`](../../../requirements/use-cases/issues/cu-sal-19.md) | `/salidas/consumibles` |
| Devolver consumibles | [`CU-SAL-20`](../../../requirements/use-cases/issues/cu-sal-20.md) | `/salidas/consumibles` |
| Generar reporte Excel | [`CU-SAL-21`](../../../requirements/use-cases/issues/cu-sal-21.md) | `/salidas/consumibles` |

La realización conserva esos identificadores en las secuencias
[frontend](../processes/frontend-code-sequences/issues/index.md) y
[backend](../processes/backend-code-sequences/issues/index.md). El
[manual compartido por actor](../../../user-manual/cases/issues/15-cap-sal-con-01-walkthrough.md)
explica la operación. El [ciclo de estados de negocio](../../../requirements/domain-and-use-cases/03-states-and-data-changed-by-action.md)
es independiente de los estados de acceso web y de los modos del formulario.
