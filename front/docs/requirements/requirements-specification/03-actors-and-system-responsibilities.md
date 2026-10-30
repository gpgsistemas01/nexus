# 3. Actores y responsabilidades

| Actor | Operaciones permitidas | Restricciones |
| --- | --- | --- |
| Personal de Almacén: Auxiliar y Coordinador | Mantener el inventario autorizado, registrar compras y solicitudes, surtir y devolver. Consultar y preparar salidas para todas las áreas. | Sin ajustes administrativos de existencias ni mantenimiento independiente de Clientes/Proveedores. |
| Usuario de área operativa | Consultar inventario y crear o editar solicitudes de materiales, consumibles y mermas para sus áreas autorizadas. | Sin cambios de inventario, surtidos, devoluciones ni administración de catálogos. |
| Administrador del sistema, en Sistemas | Todas las capacidades vigentes, incluidos ajustes, Personas, Usuarios, Directorio, catálogos y consulta independiente de movimientos. | La API comprueba la autorización en cada operación. |

Los permisos proceden de la sesión y de las asignaciones de la cuenta. Si tiene
varias, combina sus accesos autorizados. Las
[áreas operativas](../vision-scope-and-requirements/02-users-and-areas.md#áreas-operativas)
son Impresión, Taller/Herrería, Acabados, Router, PT/Tráfico e Instalaciones;
Instalaciones utiliza el rol Instalador.

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

Almacén puede buscar y crear Clientes/Proveedores desde los selectores autorizados.
El alta abre un modal y vuelve con el nuevo registro seleccionado. Cancelar conserva
la captura principal; un registro confirmado permanece aunque después se abandone
la operación de origen. Las páginas independientes, su edición y sus reportes
corresponden a Sistemas.

Los [casos de uso](../use-cases/index.md) detallan los recorridos por actor.
