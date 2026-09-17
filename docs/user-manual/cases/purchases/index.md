# Casos: Compras de material

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Capítulos

### Compras

**Propósito.** Consultar, registrar, editar y corregir compras, además de delimitar reportes.

**Ruta en el menú:** **Menú principal → Compras**.

<a id="CAP-ENT-00-NAVIGATION"></a>
![CAP-ENT-00-NAVIGATION: acceso a compras desde el menú principal](../../images/compras/00-acceso-menu-principal.png)

**Campos por modo del formulario.** En **alta** se editan tipo y número de comprobante, proveedor,
persona que recibe, fecha de recepción, observaciones y los nuevos renglones de material. En
**edición** se conservan editables el comprobante, persona que recibe, fecha, observaciones y la
incorporación de nuevos renglones; el proveedor y los detalles ya confirmados no se editan desde el
formulario principal. Cada detalle existente se cambia mediante **Corrección**, donde sólo se editan
**Cantidad correcta** y **Costo por presentación correcto**, o se retira mediante **Cancelación**.
En modo **consulta**, incluida una compra cancelada, todos los campos permanecen deshabilitados.

**Cómo cambia el estado.** El estado de la compra y de cada detalle no se captura directamente.
Una compra nueva queda confirmada con sus detalles activos. **Corrección** conserva el detalle
activo y registra los valores anterior y corregido. **Cancelación** cambia únicamente el renglón
seleccionado a cancelado, revierte su inventario y conserva su historia; cuando ya no queda ningún
detalle activo, Nexus deriva la compra como cancelada y desde entonces la presenta en modo
consulta. Abrir o editar el encabezado no cambia esos estados.

1. [1. CAP-ENT-01-LIST — Listado](01-cap-ent-01-list.md)
2. [2. CAP-ENT-02-CREATE — Formulario registro](02-cap-ent-02-create.md)
3. [3. CAP-ENT-03-EDIT — Edicion compra](03-cap-ent-03-edit.md)
4. [4. CAP-ENT-04-CORRECT — Correccion detalle](04-cap-ent-04-correct.md)
5. [5. CAP-REP-ENT-05-EXPORT — Exportar reporte](05-cap-rep-ent-05-export.md)
6. [6. CAP-ENT-06-VIEW — Consultar compra cancelada](06-cap-ent-06-view.md)
