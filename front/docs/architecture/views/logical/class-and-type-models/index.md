# Modelos de clases, interfaces y tipos

## Propósito y lectura

Esta colección representa la estructura estática que realmente consume Vue: interfaces
TypeScript, tipos derivados, contratos de props/eventos y la clase de error HTTP.
El [dominio conceptual](../../../../requirements/domain-model/index.md) explica los
conceptos del negocio; estos diagramas explican cómo los transporta y conserva el cliente.
No se exige convertir composables o componentes funcionales en clases.

Los capítulos siguientes son vistas de lectura por responsabilidad. La
[referencia de contratos TS/SFC](../type-reference/index.md) reúne en tablas los
campos, firmas, uniones y referencias de los contratos declarados en `src/`.
Su [procedimiento de generación y publicación](../../../../governance/02-generation-and-publication.md#referencia-de-contratos-declarados)
conserva comandos y resultados.

| Capítulo | Estructura representada | Figuras | Declaraciones |
| --- | --- | --- | --- |
| [Vista general](00-general-model.md) | Modelos de todos los módulos, relaciones entre registros y conexiones mediante selectores. | `DIA-VUE-DAT-015/018/019` | [Referencia completa](../type-reference/index.md) |
| [Sesión y login](01-session-and-login.md) | Sesión inyectada, credenciales, props y eventos. | `DIA-VUE-DAT-003/004` | [Acceso](../type-reference/auth.md) |
| [Transporte y selectores](02-shared-contracts.md) | Configuración Axios, error, resultado paginado, opciones y solicitudes tipadas. | `DIA-VUE-DAT-005/006/016` | [Compartidos](../type-reference/shared.md) |
| [Catálogos y directorio](03-catalogs-and-directory.md) | Capturas, filas versionadas y destinos de edición. | `DIA-VUE-DAT-007` | [Catálogos](../type-reference/catalogs.md) y [Directorio](../type-reference/directory.md) |
| [Identidades y organización](04-identity.md) | Filas, responsabilidades, cuerpos por acción y opciones de Área/Rol. | `DIA-VUE-DAT-008/014` | [Identidad](../type-reference/identity.md) |
| [Inventario](05-inventory.md) | Identidad de fila/artículo, cantidades, destinos y claves de captura. | `DIA-VUE-DAT-009/017` | [Inventario](../type-reference/warehouse.md) |
| [Movimientos y consultas](06-movements-and-queries.md) | Filtros, consulta compuesta, fila de historial y reporte. | `DIA-VUE-DAT-010` | [Movimientos](../type-reference/movements.md) |
| [Compras](07-purchases.md) | Fila, documento, detalle, captura y payload de escritura. | `DIA-VUE-DAT-001/011` | [Compras](../type-reference/purchases.md) |
| [Salidas](08-issues.md) | Encabezado, saldos, captura y modos de escritura. | `DIA-VUE-DAT-002/012` | [Salidas](../type-reference/issues.md) |
| [Genéricos y reactividad](09-reactive-contracts.md) | Contrato estructural del formulario, `Ref<T>` y propietarios de datos. | `DIA-VUE-DAT-013` | [Compartidos](../type-reference/shared.md) |

## Lectura y contratos

La [leyenda de clases y dominio](../../diagram-reading.md#clases-y-dominio) explica
compartimentos, estereotipos, flechas y multiplicidades. En esta colección:

| Construcción TypeScript | Representación y límite |
| --- | --- |
| `extends` declarado | Generalización; un alias de unión/intersección conserva su dependencia o tabla de variantes. |
| Propiedad o array | Asociación dirigida; no expresa destrucción en cascada. |
| Interfaz/alias | Describe estructura; los mappers y lectores validan JSON en ejecución. |
| Alias de valores sin estructura ni relaciones | Su definición completa resulta suficiente en la referencia; no se dibuja como una clase vacía. |
| Operación | La [vista de procesos](../../processes/index.md) explica orden, rechazo y reintento. |
