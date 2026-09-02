# Procedimientos y casos

Este capítulo integra las capturas generadas con los pasos que las requieren. El texto situado
sobre cada imagen es su ID actualizado y estable; los casos de uso asociados permiten verificar
la trazabilidad. Antes de exportar, ejecute `npm run docs:screenshots` y revise las imágenes.

## Convenciones del recorrido

- **Precondiciones:** use una cuenta ficticia autorizada y los datos indicados en el inventario.
- **Alternativas y errores:** si una acción no aparece, no cambie de cuenta; valide permisos y
  estado del registro. Si una validación impide continuar, corrija el dato señalado sin repetir
  una operación cuyo resultado sea incierto.
- **Resultado:** confirme el mensaje y el estado visible. Las acciones de existencia, surtido,
  devolución y corrección modifican inventario; las de exportación generan un archivo.

## Casos por grupo funcional

Los procedimientos se dividen por grupo para localizar una tarea sin recorrer un único archivo extenso:

- [Autenticación y navegación](cases/authentication.md): iniciar sesión y recuperarse de una página no encontrada.
- [Identidad y acceso](cases/identity-access.md): administrar personas, accesos, usuarios y contraseñas.
- [Catálogos e inventario](cases/catalogs.md): consultar y mantener materiales, proveedores, clientes y mermas.
- [Compras de material](cases/purchases.md): registrar, editar, corregir y exportar compras.
- [Salidas de material y merma](cases/issues.md): registrar, surtir, devolver y exportar salidas.
- [Consultas y reportes](cases/reports.md): consultar movimientos y seleccionar el alcance de su exportación.

## Manuales por actor

Cada guía de actor funciona como punto de entrada y enlaza únicamente los grupos que corresponden a sus responsabilidades:

- [Administrador del sistema](actors/administrator.md).
- [Personal de almacén](actors/warehouse.md).
- [Usuario de consultas y reportes](actors/reporting.md).
