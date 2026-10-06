# Procedimientos y casos

## Cómo seguir un procedimiento

Cada procedimiento indica su propósito, las condiciones previas, los controles necesarios, los
pasos y el resultado que debe comprobar. Use sólo las acciones visibles para su cuenta y para el
estado actual del registro.

- **Precondiciones:** confirme que cuenta con autorización y que los registros relacionados están
  vigentes.
- **Alternativas y errores:** si una acción no aparece, valide sus permisos y el estado del
  registro. Si Nexus rechaza un dato, corrija el campo señalado. Antes de repetir una escritura,
  compruebe si el registro o la existencia cambiaron.
- **Capturas:** utilícelas para localizar controles y reconocer el modo o estado descrito.
- **Resultado:** confirme el mensaje y el estado visible. Las acciones de existencia, surtido,
  devolución y corrección modifican inventario; las de exportación generan un archivo.

🟨 **ADVERTENCIA:** antes de confirmar una escritura, revise la
[matriz de validación y modos](form-validation-matrix.md). Una acción visible después de surtir,
devolver, corregir o cancelar puede habilitar menos campos que la edición general.

🟥 **DATO SENSIBLE:** no incluya contraseñas, cookies, tokens ni datos personales en archivos,
capturas o solicitudes de soporte.

## Casos por grupo funcional

Seleccione el grupo correspondiente a la tarea que necesita completar:

- [Autenticación y navegación](cases/authentication/index.md): iniciar sesión y recuperarse de una página no encontrada.
- [Identidad y acceso](cases/identity-access/index.md): administrar personas, accesos, usuarios y contraseñas.
- [Catálogos e inventario](cases/catalogs/index.md): consultar y mantener materiales, proveedores, clientes y mermas.
- [Compras de materiales y consumibles](cases/purchases/index.md): registrar, editar, corregir, cancelar y exportar cada contexto.
- [Salidas de material y merma](cases/issues/index.md): registrar, surtir, devolver y exportar salidas.
- [Exportaciones desde consultas](cases/reports/index.md): exportar inventarios y movimientos desde su consulta correspondiente.

## Manuales por actor

- [Administrador del sistema](actors/administrator.md): administración, catálogos, operación e
  historiales autorizados.
- [Personal de almacén](actors/warehouse.md): inventario, compras y salidas permitidas.

Los reportes aparecen únicamente en el manual del actor que puede abrir el módulo.
