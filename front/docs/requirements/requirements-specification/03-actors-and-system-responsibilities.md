# 3. Actores y responsabilidades

| Actor | Operaciones permitidas | Restricciones |
| --- | --- | --- |
| Personal de Almacén: Auxiliar y Coordinador | Mantener el inventario autorizado, registrar compras y solicitudes, surtir y devolver. Consultar y preparar salidas para todas las áreas. | Sin ajustes administrativos de existencias ni mantenimiento independiente de Clientes/Proveedores. |
| Usuario de área operativa | Consultar inventario y crear o editar solicitudes de materiales, consumibles y mermas para sus áreas autorizadas. | Sin cambios de inventario, surtidos, devoluciones ni administración de catálogos. |
| Administrador del sistema, en Sistemas | Todas las capacidades vigentes, incluidos ajustes, Personas, Usuarios, Directorio, catálogos y consulta independiente de movimientos. | La API comprueba la autorización en cada operación. |

Los permisos proceden de la sesión y de las asignaciones de la cuenta. Si tiene
varias, combina sus accesos autorizados. El catálogo de áreas y los roles
operativos se describen en
[Usuarios y áreas](../vision-scope-and-requirements/02-users-and-areas.md#áreas-operativas).

Dirección aún no tiene acceso definido y Ventas no tiene acceso vigente. Figurar
como solicitante, asesor, receptor, cliente o proveedor en un documento no convierte
a ese registro en una cuenta ni le concede permisos.

## Responsabilidades del cliente y de la API

| Ámbito | Cliente Vue | API |
| --- | --- | --- |
| Acceso | Presentar páginas y acciones según la sesión. | Comprobar sesión, permisos y áreas en cada petición. |
| Captura | Validar los campos y conservar los datos corregibles. | Validar relaciones, versiones y estado vigente. |
| Existencias e importes | Mostrar saldos y cálculos previos; esperar la confirmación. | Calcular y confirmar documento, stock y movimientos sin cambios parciales. |
| Historia | Mostrar la información permitida. | Conservar datos e historia y aplicar la auditoría configurada. |

## Alta contextual de clientes y proveedores

Almacén conserva la búsqueda y el alta de Clientes/Proveedores desde los selectores
autorizados. Las páginas independientes, su edición y sus reportes corresponden a
Sistemas. La interacción del alta y su independencia del documento principal se
rigen por `RF-VUE-012` y sus criterios de aceptación.

Los [casos de uso](../use-cases/index.md) detallan los recorridos por actor.
