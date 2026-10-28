# Contratos y relaciones de datos

La colección de [clases, interfaces y tipos](class-and-type-models/index.md) desarrolla
los contratos estáticos por responsabilidad: sesión/login, transporte/selectores,
catálogos/directorio, identidad, inventario, movimientos, compras y salidas.

Los modelos de [compra](class-and-type-models/07-purchases.md) (`DIA-VUE-DAT-001`) y
[salida](class-and-type-models/08-issues.md) (`DIA-VUE-DAT-002`) conservan sus identificadores.
Sus interfaces distinguen fila de tabla, documento leído y captura. Los atributos
seleccionados se acompañan de variantes y transformaciones de escritura.

El [dominio conceptual](../../../requirements/domain-model/index.md) explica las relaciones
del negocio. Los tipos explican objetos en memoria; los
[estados](states/index.md) explican modos y las [secuencias](../processes/index.md),
orden y recuperación. Ninguna interfaz TypeScript sustituye la validación JSON de la API.
