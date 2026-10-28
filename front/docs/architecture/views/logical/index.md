# Vista lógica

## Contenido

1. [Interfaz, componentes y transporte](ui-and-http.md): composición visual y fronteras.
2. [Estado y ciclo de vida](state-and-lifecycle.md): propiedad, aislamiento y transición.
3. [Entradas y salida segura](input-security.md): normalización, validación y texto.
4. [Componentes por dominio](components/index.md).
5. [Clases, interfaces y tipos](class-and-type-models/index.md): sesión/login, transporte,
   selectores, catálogos/directorio, identidad, inventario, movimientos, compras y salidas.
6. [Estados de interacción y captura](states/index.md): modos y recuperación de compra,
   salida y merma pendiente.

## Relaciones entre niveles

El [dominio conceptual](../../../requirements/domain-model/index.md) representa conceptos
y reglas del negocio. Los modelos de tipos de esta vista representan sus proyecciones
en memoria; las asociaciones de `details` son arrays, no relaciones SQL. Los componentes
explican propietarios de estado y dependencias; los estados explican transiciones.
Las [secuencias](../processes/index.md) completan el orden de llamadas.

Una clase de error puede ser una clase real; una interfaz de fila no se instancia
como clase y un composable no se convierte en servicio orientado a objetos por usar
un diagrama UML. Las extensiones, dependencias y variantes se contrastan con TypeScript.

El [corte de componentes](../overview.md#vista-de-componentes-navegación-y-acceso-a-catálogos)
relaciona navegación, sesión, dominio y HTTP. Las [interfaces](../../contracts/index.md)
concretan qué se intercambia; los [patrones](../development/design-and-construction-patterns/index.md)
describen mecanismos reutilizados.
