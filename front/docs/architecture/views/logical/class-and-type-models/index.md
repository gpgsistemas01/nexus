# Modelos de clases, interfaces y tipos

## Propósito y lectura

Esta colección representa la estructura estática que realmente consume Vue: interfaces
TypeScript, tipos derivados, contratos de props/eventos y la clase de error HTTP.
El [dominio conceptual](../../../../requirements/domain-model/index.md) explica los
conceptos del negocio; estos diagramas explican cómo los transporta y conserva el cliente.
No se exige convertir composables o componentes funcionales en clases.

| Capítulo | Estructura representada | Figuras |
| --- | --- | --- |
| [Sesión y login](01-session-and-login.md) | Sesión inyectada, credenciales, props y eventos. | `DIA-VUE-DAT-003/004` |
| [Transporte y selectores](02-shared-contracts.md) | Configuración Axios, error, resultado paginado y opciones. | `DIA-VUE-DAT-005/006` |
| [Catálogos y directorio](03-catalogs-and-directory.md) | Capturas, filas versionadas y destinos de edición. | `DIA-VUE-DAT-007` |
| [Identidades y organización](04-identity.md) | Filas, responsabilidades, cuerpos por acción y opciones de Área/Rol. | `DIA-VUE-DAT-008/014` |
| [Inventario](05-inventory.md) | Identidad de fila/artículo, cantidades y destinos. | `DIA-VUE-DAT-009` |
| [Movimientos y consultas](06-movements-and-queries.md) | Filtros, consulta compuesta, fila de historial y reporte. | `DIA-VUE-DAT-010` |
| [Compras](07-purchases.md) | Fila, documento, detalle, captura y payload de escritura. | `DIA-VUE-DAT-001/011` |
| [Salidas](08-issues.md) | Encabezado, saldos, captura y modos de escritura. | `DIA-VUE-DAT-002/012` |
| [Genéricos y reactividad](09-reactive-contracts.md) | Contrato estructural del formulario, `Ref<T>` y propietarios de datos. | `DIA-VUE-DAT-013` |

## Lectura y contratos

La [leyenda de clases y dominio](../../diagram-reading.md#clases-y-dominio) explica
compartimentos, estereotipos, flechas y multiplicidades. En esta colección:

| Construcción TypeScript | Representación y límite |
| --- | --- |
| `extends` declarado | Generalización; un alias de unión/intersección conserva su dependencia o tabla de variantes. |
| Propiedad o array | Asociación dirigida; no expresa destrucción en cascada. |
| Interfaz/alias | Describe estructura; los mappers y lectores validan JSON en ejecución. |
| Operación | La [vista de procesos](../../processes/index.md) explica orden, rechazo y reintento. |
