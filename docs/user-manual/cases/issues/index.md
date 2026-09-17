# Casos: Salidas de material y merma

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Capítulos

**Cómo cambia el estado.** El estado no es un campo editable. Al registrar una salida y sus
detalles, Nexus los deja **Pendientes**. Al confirmar un surtido, el sistema calcula
automáticamente **Surtido parcial** o **Surtido** según la cantidad acumulada. La devolución sólo
está disponible sobre un detalle surtido: una devolución parcial conserva el detalle como
**Surtido** y devolver toda la cantidad lo deja **Cancelado**. Si todos los detalles quedan
cancelados, Nexus también cancela la salida. Estos cambios actualizan documento, detalle,
existencia y movimiento como una sola operación; abrir el formulario o cambiar de modo no altera
por sí solo ningún estado. **Devolver** es la acción que registra el retorno y reintegra
existencias; **cancelar** no es otro botón ni otro procedimiento para las salidas, sino el resultado
automático de una devolución total. A nivel de detalle se cancela sólo el renglón devuelto por
completo; a nivel de encabezado, la salida se cancela sólo si todos sus renglones ya están
cancelados.

### Salidas de material

**Propósito.** Registrar y dar seguimiento al surtido y devolución de materiales.

**Ruta en el menú:** **Menú principal → Salidas → Materiales**.

<a id="CAP-SAL-MAT-00-NAVIGATION"></a>
![CAP-SAL-MAT-00-NAVIGATION: acceso a salidas de material desde el menú principal](../../images/salidas-material/00-acceso-menu-principal.png)

**Campos por modo del formulario.** En **alta** se editan cliente, asesor, área, solicitante, número
de proyecto, fecha de solicitud, observaciones y los materiales solicitados. En **edición completa**
se habilitan esos mismos datos y la incorporación de detalles sólo mientras la salida esté
pendiente; después, la edición se limita al **encabezado** y los detalles quedan de consulta. En
**surtido** el encabezado es de sólo lectura y únicamente se editan **Surtir** y **Cantidad de
proyecto** en los renglones pendientes. En **devolución** el documento es de sólo lectura y la acción
habilita únicamente **Cantidad a devolver** y **Observaciones**. Una salida cancelada se abre en
**consulta**, sin campos editables.

1. [1. CAP-SAL-MAT-01-LIST — Listado](01-cap-sal-mat-01-list.md)
2. [2. CAP-SAL-MAT-02-CREATE — Formulario registro](02-cap-sal-mat-02-create.md)
3. [3. CAP-SAL-MAT-03-EDIT — Edicion encabezado](03-cap-sal-mat-03-edit.md)
4. [4. CAP-SAL-MAT-04-SUPPLY — Surtir detalles](04-cap-sal-mat-04-supply.md)
5. [5. CAP-SAL-MAT-05-RETURN — Devolver detalle](05-cap-sal-mat-05-return.md)
6. [6. CAP-REP-SAL-MAT-06-EXPORT — Exportar reporte](06-cap-rep-sal-mat-06-export.md)
7. [7. CAP-SAL-MAT-08-VIEW — Consultar salida cancelada](07-cap-sal-mat-08-view.md)

### Salidas de merma

**Propósito.** Registrar y dar seguimiento al surtido y devolución de mermas.

**Ruta en el menú:** **Menú principal → Salidas → Mermas**.

<a id="CAP-SAL-WAS-00-NAVIGATION"></a>
![CAP-SAL-WAS-00-NAVIGATION: acceso a salidas de merma desde el menú principal](../../images/salidas-merma/00-acceso-menu-principal.png)

**Campos por modo del formulario.** En **alta** se editan cliente, asesor, área, solicitante, número
de proyecto, fecha de solicitud, observaciones y las mermas solicitadas. En **edición completa** se
habilitan esos mismos datos y la incorporación de detalles sólo mientras la salida esté pendiente;
después, la edición se limita al **encabezado** y los detalles quedan de consulta. En **surtido** el
encabezado es de sólo lectura y únicamente se editan **Surtir** y **Cantidad de proyecto** en los
renglones pendientes. En **devolución** el documento es de sólo lectura y la acción habilita
únicamente **Cantidad a devolver** y **Observaciones**. Una salida cancelada se abre en **consulta**,
sin campos editables.

8. [8. CAP-SAL-WAS-01-LIST — Listado](08-cap-sal-was-01-list.md)
9. [9. CAP-SAL-WAS-02-CREATE — Formulario registro](09-cap-sal-was-02-create.md)
10. [10. CAP-SAL-WAS-03-EDIT — Edicion encabezado](10-cap-sal-was-03-edit.md)
11. [11. CAP-SAL-WAS-04-SUPPLY — Surtir detalles](11-cap-sal-was-04-supply.md)
12. [12. CAP-SAL-WAS-05-RETURN — Devolver detalle](12-cap-sal-was-05-return.md)
13. [13. CAP-REP-SAL-WAS-06-EXPORT — Exportar reporte](13-cap-rep-sal-was-06-export.md)
14. [14. CAP-SAL-WAS-08-VIEW — Consultar salida cancelada](14-cap-sal-was-08-view.md)
