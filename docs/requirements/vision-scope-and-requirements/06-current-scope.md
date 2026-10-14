# 6. Alcance actual

## Incluido

1. Aplicación web con acceso autenticado y acciones autorizadas.
2. Cuentas de usuario, personas y asignaciones de acceso o de responsabilidad,
   distinguiendo su significado.
3. Materiales con presentación, unidad y ofertas por proveedor, existencias y cantidades convertidas.
4. Consumibles clasificados explícitamente, sin dimensiones, con presentación y unidad
   de medida, separados de materiales en consultas, documentos y reportes.
5. Proveedores, clientes y asesores asociados a personas.
6. Recepciones de compra de materiales o consumibles con detalle, importes,
   correcciones, cancelación de renglones y movimientos de entrada.
7. Salidas separadas de material, consumible y merma, con surtido de detalles completos,
   cumplimiento parcial del documento cuando quedan detalles pendientes y devoluciones
   una vez surtida la salida completa.
8. Inventario de merma, entradas adicionales de merma y ajustes autorizados de
   existencias de materiales, consumibles y mermas, con historia y movimientos.
9. Consultas y reportes Excel autorizados de inventario, compras, salidas, mermas,
   proveedores, clientes, personas, usuarios y movimientos; notificaciones operativas.
10. Administración autorizada de áreas, roles, presentaciones, unidades de medida,
    motivos de ajuste y estados de cumplimiento. Los restantes estados técnicos no
    constituyen catálogos administrables del alcance vigente.

## Fuera del alcance actual

- Contabilidad, pagos, cobranza, facturación fiscal y conciliación bancaria.
- Planeación de compras, reabastecimiento automático y requisiciones de compra.
- Administración de proyectos; el contexto de proyecto en una salida no supone un módulo de gestión.
- Modificación dinámica de la política de permisos desde la interfaz.
- Aplicación móvil nativa, operación sin conexión e integraciones públicas con ERP,
  CRM o transportistas.
- Eliminación física generalizada del historial operacional.

## Supuestos, dependencias y restricciones

- **Supuesto de operación:** las personas autorizadas registran documentos y cantidades
  correspondientes a los hechos del almacén. Nexus no verifica físicamente una entrega;
  la responsabilidad de captura debe acordarse con el negocio.
- **Dependencias:** disponer de cuentas autorizadas, catálogos vigentes, datos de
  proveedores y clientes y conectividad al servicio web. La preparación y validación
  de datos de inicio deben acordarse antes de una puesta en operación.
- **Restricciones de negocio:** conservar historia, separar contextos de inventario y
  comprobar los accesos. Las reglas detalladas son propiedad de la SRS.
- **Restricciones técnicas:** las tecnologías y condiciones de despliegue vigentes se
  documentan en arquitectura; no se convierten aquí en objetivos de negocio nuevos.

Estos supuestos y dependencias identifican condiciones para revisar con los interesados,
no acuerdos ya aprobados. Sus decisiones pendientes se conservan en el capítulo 10.
