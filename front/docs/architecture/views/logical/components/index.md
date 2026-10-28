# Componentes por dominio

Cada corte muestra colaboradores reales y dirección de dependencia. Las flechas no son mensajes temporales; las secuencias pertenecen a Procesos.

La [guía visual](../../diagram-reading.md#mapas-y-actividades) explica cajas, agrupaciones
y líneas; cada corte concreta qué representa su dependencia.

Una flecha continua va del consumidor al colaborador utilizado. Los grupos nombran
su responsabilidad y seleccionan imports reales; una relación con un grupo no enumera
todos sus archivos. Los mappers devuelven datos al consumidor y no importan servicios
ni presentación. Los composables genéricos reciben operaciones del dominio por callback;
la [vista de procesos](../../processes/00-reading-and-roles.md) desarrolla su ejecución.

- [Acceso y sesión](01-access.md).
- [Inventario y merma](02-inventory.md).
- [Catálogos administrables](03-catalogs.md).
- [Identidad y directorio](04-identity-directory.md).
- [Historiales y reportes](05-movements.md).
- [Compras y correcciones](06-purchases.md).
- [Salidas, surtido y devolución](07-issues.md).
