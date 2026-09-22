# 6. Alcance actual

### Incluido

1. Aplicación web autenticada, API REST y sesión mediante tokens en cookies.
2. Cuentas de usuario, personas, roles, departamentos y asignaciones de acceso.
3. Catálogo de materiales con presentación, unidad de medida y relaciones por
   proveedor, incluido stock físico y cantidad convertida.
4. Proveedores, clientes y asesores asociados a personas.
5. Recepciones de compra con detalle, importes, correcciones, cancelación de líneas y
   movimientos de entrada.
6. Salidas de almacén con detalle por proveedor, surtido parcial o total,
   devoluciones y movimientos de salida.
7. Mermas, ajustes de stock, motivos y movimientos independientes de merma.
8. Historial de movimientos, notificaciones en tiempo real y reportes Excel de
   inventario, compras, salidas, mermas, proveedores, clientes, personas, usuarios y
   movimientos.

### Fuera del alcance actual

- Contabilidad, pagos, cobranza, facturación fiscal y conciliación bancaria.
- Planeación de compras o reabastecimiento automático.
- Requisiciones de compra; el módulo anterior fue retirado del código y del esquema.
- Administración dinámica de la matriz de permisos desde la interfaz; la matriz está
  versionada en código.
- Aplicación móvil nativa, operación sin conexión e integraciones públicas con ERP,
  CRM o transportistas.
- CRUD público de proyectos, estados generales, roles, departamentos, presentaciones,
  unidades, motivos o estados de surtido; varios son catálogos de solo lectura en la
  API actual.
- Eliminación física generalizada del historial operacional.
