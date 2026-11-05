# Componentes por responsabilidad

Los mapas muestran archivos y exports propios de Nexus y sus dependencias directas.
La [leyenda de componentes](../../diagram-reading.md#componentes-y-dependencias)
define cajas, flechas y límites de esta notación de flujo Mermaid.

| Capítulo | Cortes y figuras |
| --- | --- |
| [Acceso y sesión](01-access.md) | Arranque, login y sesión: `DIA-VUE-COMP-001`. |
| [Inventario y merma](02-inventory.md) | Listado/editor: `002`; selección y recuperación: `010`. |
| [Catálogos](03-catalogs.md) | Consulta, definición y guardado: `003`. |
| [Identidad y directorio](04-identity-directory.md) | Personas/cuentas: `004`; directorio independiente y contextual: `008`. |
| [Historiales y reportes](05-movements.md) | Filtros y paginación: `005`; coordinación y transporte del reporte: `013`. |
| [Compras](06-purchases.md) | Composición/apertura: `006`; captura y corrección: `011`; alta de detalle: `014`. |
| [Salidas](07-issues.md) | Documento/devolución: `007`; área de encabezado/filtros: `012`. |
| [Composición visual compartida](08-shared-ui.md) | Marcos y selector: `009`; fuentes de tema y estilos. |

Los números abreviados conservan el prefijo `DIA-VUE-COMP-`. Separar cortes de
un dominio permite seguir una responsabilidad sin agrupar archivos distintos dentro
de una misma caja ni repetir todo el inventario de imports.

Las [secuencias](../../processes/index.md) desarrollan orden, eventos y callbacks.
Los [contratos](../../../contracts/form-and-event-contracts.md) definen intercambios;
la [referencia generada](../../development/code-reference.md), todas las fuentes e imports.
