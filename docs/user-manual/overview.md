# Información común de uso

## Acceso por actor y seguridad

Las opciones disponibles dependen del actor autenticado y de los permisos asignados. Nexus
comprueba la autorización en cada operación. **Catálogos** corresponde sólo al administrador del
sistema; **Consumibles** pertenece a Almacén y usa el acceso de consulta de materiales.

## Antes de comenzar

Este manual se prepara para personal autorizado. Requiere un navegador compatible, la URL del
entorno y una cuenta asignada. Las opciones visibles dependen del rol y el área; una ausencia de
opción no se debe resolver compartiendo credenciales.

🟥 **DATO SENSIBLE:** no incluya contraseñas, cookies, tokens ni datos personales en
capturas, exportaciones o solicitudes de soporte.

## Acceso

1. Abra la URL de Nexus.
2. Capture sus credenciales y seleccione **Iniciar sesión**.
3. Compruebe que se muestre la página autorizada para su cuenta.

## Módulos

Las secciones de entradas, salidas, inventario, materiales, mermas, clientes, proveedores,
personas y usuarios se presentan en los [procedimientos y casos](procedures.md), siguiendo la
secuencia **propósito → precondiciones → recorrido principal → alternativas → errores →
resultado**. Cada procedimiento muestra la captura estable al aparecer la pantalla que representa
y advierte si modifica existencias o genera un archivo. Esa entrada divide el recorrido por grupo
funcional y ofrece guías específicas para administrador, almacén y usuarios de consultas y reportes.

La [matriz de validación y modos de formulario](form-validation-matrix.md) permite localizar los
campos comprobados, la recuperación esperada y las excepciones de edición sin duplicar las reglas
en cada procedimiento.

### Continuidad de consultas y exportaciones

Cada exportación se realiza desde el módulo donde se consultó y filtró la información:

- materiales y su reporte de inventario;
- proveedores y clientes con su exportación desde el listado;
- mermas y su reporte de inventario;
- compras y su reporte mensual;
- salidas de material o merma y el reporte del mismo contexto;
- personas y usuarios con su exportación desde el listado;
- movimientos de material o merma y su reporte correspondiente.

El recorrido es **abrir módulo → consultar → filtrar → exportar → recibir archivo**.

## Solución de problemas

Consulte el [catálogo de mensajes de error](error-messages.md) para identificar cómo se presenta
cada tipo de fallo, qué información conservar y cuándo debe intentarse nuevamente la operación.

- Si una opción no aparece, solicite validar rol, departamento y permiso; no intente otra cuenta.
- Si una operación falla, conserve el mensaje y la referencia mostrada, y evite repetir una
  escritura hasta confirmar su estado.
- No incluya contraseñas, cookies ni datos personales en una captura de soporte.
