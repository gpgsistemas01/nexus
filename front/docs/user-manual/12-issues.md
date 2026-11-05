# 12. Salidas

## Elegir el contexto y consultar

Abra **Salidas → Materiales**, **Consumibles** o **Mermas**. Busque por folio o proyecto,
aplique filtros de encabezado, fechas u **Observaciones contiene:** y pulse **Buscar**.
Cada tabla contiene sólo su contexto; no mezcle material y merma del mismo nombre.

El índice de su manual indica las áreas disponibles para su cuenta. Limpiar filtros
conserva ese alcance.

Si sólo tiene un área, **Área** se selecciona y queda visible y bloqueada en filtros y
formulario. **Limpiar filtros** la conserva y retira los filtros opcionales. Con varias
áreas autorizadas, puede elegir entre ellas.

![Listado de salidas con búsqueda, filtros y acciones por documento.](images/22-issues-list.png)

<!-- manual:any goods:issues-manage waste:issues-manage -->
## Registrar una solicitud

**Antes de empezar.** Reúna cliente, asesor, área, solicitante, proyecto y artículos.
Guardar registra la solicitud; Almacén atiende su entrega.

1. Pulse **Nueva salida**.
2. En **Registrar salida** o **Registrar salida de merma**, seleccione
   **Cliente** y **Asesor**. Revise **Área**: si está seleccionada y bloqueada,
   corresponde a su única área disponible. Si puede elegir, seleccione el área que
   recibirá los artículos. Después seleccione **Solicitante** entre las personas de
   esa área; sus opciones se cargan automáticamente.
3. Capture **Número de proyecto**, revise **Fecha y hora de solicitud:** y
   complete **Observaciones** cuando corresponda.
4. Seleccione **Material**, **Consumible** o **Merma**, capture **Cantidad** y
   compruebe **Presentación**; este último campo se completa automáticamente.
5. Pulse **Agregar** y compruebe el detalle preparado. Repita para los demás
   artículos. Retire un detalle equivocado antes de guardar.
6. Revise encabezado y detalles, pulse **Guardar** y espere la confirmación.
7. Consulte el folio registrado y su estado de cumplimiento.

Repetir el mismo artículo y proveedor **suma** su cantidad al detalle. Otro proveedor
conserva un detalle distinto. Revise la cantidad acumulada antes de guardar.

Para Materiales y Consumibles, la cantidad debe ser al menos 1; para Mermas puede
ser menor que 1, siempre que sea positiva. La fecha y hora de solicitud corresponden
al horario de Ciudad de México. Si cambia Cliente o Área, revise de nuevo Asesor,
Solicitante y Número de proyecto: sus selecciones dependientes se actualizan.

Para **GPG INTERNO**, conserve el número de proyecto que completa **Área**. Si falta,
solicite su revisión; escribir otro puede impedir guardar.

![Preparación de una solicitud de salida con sus datos y detalle.](images/23-issue-create.png)

<!-- manual:any clients:create -->
Si no encuentra un cliente, escriba su nombre en **Cliente** y pulse
**Registrar cliente «nombre»** dentro del desplegable. Complete y guarde el
formulario secundario; el nuevo cliente quedará seleccionado.
<!-- manual:end -->
<!-- manual:end -->

## Consultar un documento

**Consultar salida** abre el documento para revisar encabezado y detalles solicitados.
Use **Regresar** al terminar. Las opciones de carga y
recuperación se explican en [Consultas de documentos](02-navigation-and-controls.md#consultas-de-documentos).

<!-- manual:any goods:issues-manage waste:issues-manage -->
## Editar una solicitud

1. Para una corrección, abra **Editar salida** del folio adecuado.
2. Modifique sólo los campos habilitados.
3. Cuando el estado permita corregir detalles pendientes, revise sus cantidades
   antes de añadirlos o retirarlos.
4. Pulse **Actualizar** y compruebe el documento.

Con detalles surtidos puede quedar habilitado sólo el encabezado. Para corregir
una entrega realizada, avise a Almacén.
<!-- manual:end -->

<!-- manual:any goods:issue-details-manage waste:issues-supply -->
## Surtir

**Antes de confirmar.** Surtir descuenta inventario. Compruebe solicitud, artículos
y existencia; marque sólo lo que entrega físicamente.

1. Pulse **Surtir detalle** en la salida.
2. Revise el encabezado de consulta y los detalles pendientes.
3. Marque **Surtir** en los detalles que realmente entregará.
4. En **Cantidad a surtir**, capture lo que entregará ahora, en la presentación del
   artículo. El campo indica el saldo pendiente; no puede superarlo.
5. Revise **Cantidad de proyecto**, expresada en la unidad de conversión. Es el
   valor total del detalle para el proyecto; no se suma en cada entrega.
6. Revise la selección y pulse **Surtir**.
7. Espere la confirmación y compruebe cantidades surtidas, cumplimiento y saldo.

![Selección de detalles pendientes para surtir.](images/24-issue-supply.png)

Por ejemplo, si se solicitan 2 rollos y entrega 0.5, se descuentan 0.5 y quedan
1.5 pendientes. El detalle queda **Surtido** al completar los 2 rollos.
**Surtido parcial** también puede indicar otros detalles pendientes.

**Diferencia** compara la conversión de la salida con **Cantidad de proyecto**.
Un valor negativo indica que el proyecto supera esa conversión: revise los datos;
Nexus conserva la captura y no la reemplaza para hacer coincidir los valores.
<!-- manual:end -->

<!-- manual:any goods:issue-details-manage waste:issues-supply -->
## Devolver una entrega

**Antes de confirmar.** Devolver reintegra existencias. Compruebe el artículo y la
cantidad que regresaron de una entrega previa.

La salida completa debe tener cumplimiento **Surtido**. Mientras permanezca en
**Surtido parcial**, no puede devolver un detalle que ya fue entregado.

1. En una salida con cumplimiento **Surtido**, pulse **Devolver material surtido**.
2. Localice el detalle entregado y pulse **Devolver detalle de salida**.
3. Revise las cantidades del detalle y el saldo que aún admite devolución.
4. Capture **Cantidad a devolver** y **Observaciones**.
5. Pulse **Devolver** y espere la confirmación.
6. Consulte el detalle para comprobar la cantidad devuelta y el inventario
   reintegrado.

![Devolución de un detalle que ya fue surtido.](images/25-issue-return.png)

El saldo entregado es el máximo que puede devolver. **Regresar** cierra sin enviar.

Una devolución parcial conserva el detalle **Surtido**; devolver todo su saldo lo
deja **Cancelado**. Al cancelar todos los detalles se cancela la salida. No hay una
acción independiente de cancelación.
<!-- manual:end -->

<!-- manual:any warehouse:reports-read -->
## Reportes e incidencias

Use **Exportar Excel** después de aplicar los filtros con **Buscar**.
[Reportes](14-reports.md) explica el alcance; [Errores y recuperación](15-errors-and-recovery.md),
los conflictos y envíos sin respuesta.
<!-- manual:end -->
