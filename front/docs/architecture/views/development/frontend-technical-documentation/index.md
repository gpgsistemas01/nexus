# Realización de módulos en Vue

Estas guías explican a desarrollo cómo el cliente realiza las capacidades actuales.
No son otro manual operativo ni una segunda especificación de requisitos. Cada
capítulo conserva propósito/fuentes, alcance, contratos, responsabilidades y
evidencia según [el criterio documental](../../../../index.md#organización-y-fuentes-propietarias).

## Capítulos

1. [Login Vue](01-authentication.md).
2. [Almacén en Vue](02-warehouse.md).
3. [Catálogos en Vue](03-catalogs.md).
4. [Identidad y directorio comercial en Vue](04-identity-and-directory.md).
5. [Movimientos en Vue](05-movements.md).
6. [Compras en Vue](06-purchases.md).
7. [Salidas en Vue](07-issues.md).
8. [Contratos de captura, eventos y recuperación](08-form-and-event-contracts.md).

## Propiedad y límites

La [correspondencia funcional](../../../../index.md#trazabilidad)
conduce a los casos existentes; el alcance de cada cliente se declara en su guía.
Las guardas y controles orientan la interfaz; la API comprueba cada petición.
Los archivos y símbolos se consultan desde el capítulo afectado y el código real.
Una modificación común enlaza [Arquitectura](../../../index.md) o
[Patrones](../design-and-construction-patterns/index.md), sin copiar sus diagramas a todos los módulos.

Los [estados de captura y documento](../../logical/document-states.md) complementan
las secuencias de cada módulo; los [patrones](../design-and-construction-patterns/index.md)
concentran modelos generales y aplicaciones específicas.
