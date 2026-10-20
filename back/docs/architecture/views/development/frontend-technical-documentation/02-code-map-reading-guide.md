# 2. Convenciones para leer los mapas de código: frontend

Los módulos se localizan en el [índice de esta referencia](index.md#módulos). Este
capítulo define cómo interpretar sus figuras; la lista de módulos se mantiene sólo
en el índice.

## Unidad representada y relaciones

Cada mapa identifica módulos ES y dependencias comprobables. Un nodo agrupa archivos
por responsabilidad; su tabla enumera las rutas completas, aunque la etiqueta visual
sólo nombre archivos principales. La figura selecciona relaciones que explican esa
colaboración; el inventario completo permanece en el [mapa generado](../code-map.md).

| Elemento | Significado de lectura |
| --- | --- |
| Flecha de import | El grupo de origen importa funciones o valores del destino. No representa un paso de una petición. |
| Grupo de archivos | Responsabilidad de implementación; no es una clase ni una unidad de despliegue. |
| Configuración o contexto | Relación rotulada en su figura; se distingue del import cuando se recibe como argumento. |
| Variante tipada | Material/consumable selecciona adaptadores o contexto; no implica duplicar todo el núcleo. |
| Tabla de contratos | Operaciones, datos, resultados y límites que corresponden al recurso. |
| Fuente compartida | Enlace al propietario de Prisma, patrón o núcleo reutilizable, para ampliar la explicación. |

## Alcance de la evidencia

Los mapas muestran imports entre grupos seleccionados. Constantes, errores y utilidades
transversales se consultan en [código compartido](03-shared-code-and-coverage.md).
La coincidencia de nombres entre archivos no demuestra herencia ni permite inferir
una llamada que no existe. Las relaciones y exports se contrastan con el código.

La unidad de documentación es el módulo implementado, no cada caso de uso. Las
secuencias, decisiones de ejecución y estados tienen su fuente en
[procesos](../../processes/index.md); los requisitos conservan el objetivo y las reglas
normativas. Este capítulo no mantiene otra lista de capítulos ni repite sus diagramas.
