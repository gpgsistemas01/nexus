# Casos: Compras de material

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Compras

**Propósito.** Consultar, registrar, editar y corregir compras, además de delimitar reportes.

<a id="CAP-ENT-01-LIST"></a>
### CAP-ENT-01-LIST — Listado

**Casos:** `CU-ENT-01`.

**Errores posibles:** [Compras](../error-messages.md#errores-compras).

**Controles que debe usar:** Buscador **Buscar por Folio o N° Factura**; filtros de fecha, **Proveedor** y **Persona que recibe**; botones **Buscar / filtrar**, **Limpiar filtros**, **Exportar Excel** y **Nueva compra**, y acciones por fila.

1. Revise el listado y use sus filtros o acciones disponibles.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-ENT-01-LIST: listado](../images/compras/01-listado.png)

<a id="CAP-ENT-02-CREATE"></a>
### CAP-ENT-02-CREATE — Formulario registro

**Casos:** `CU-ENT-02`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Compras](../error-messages.md#errores-compras).

**Controles que debe usar:** Botón **Nueva compra**; opciones **Factura** o **Remisión**; campos **Número de Factura**, **Proveedor**, **Persona que recibe**, **Fecha y hora de recepción** y **Observaciones**; detalle con material, **Cantidad**, **Costo por Presentación** y botón **Agregar**; botón **Confirmar**.

1. Abra la acción de alta, capture los campos requeridos y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-ENT-02-CREATE: formulario registro](../images/compras/02-formulario-registro.png)

<a id="CAP-ENT-03-EDIT"></a>
### CAP-ENT-03-EDIT — Edicion compra

**Casos:** `CU-ENT-03`, `CU-ENT-05`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Compras](../error-messages.md#errores-compras).

**Controles que debe usar:** Acción **Editar registro**; controles del encabezado y de los detalles de compra, botones **Agregar**, **Actualizar** y **Regresar**.

1. Seleccione un registro editable, revise los datos y confirme únicamente los cambios necesarios.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-ENT-03-EDIT: edicion compra](../images/compras/03-edicion-compra.png)

<a id="CAP-ENT-04-CORRECT"></a>
### CAP-ENT-04-CORRECT — Correccion detalle

**Casos:** `CU-ENT-04`.

**Errores posibles:** [Validación de formularios](../error-messages.md#errores-validacion), [Compras](../error-messages.md#errores-compras).

**Controles que debe usar:** Acción de edición de la compra y botón **Corregir detalle** del renglón; campos **Cantidad correcta** y **Costo por presentación correcto**; botones **Corregir detalle** y **Regresar**.

1. Abra la compra y el detalle corregible, capture la corrección y su motivo y confirme.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-ENT-04-CORRECT: correccion detalle](../images/compras/04-correccion-detalle.png)

<a id="CAP-REP-ENT-05-EXPORT"></a>
### CAP-REP-ENT-05-EXPORT — Exportar reporte

**Casos:** `CU-REP-11`.

**Errores posibles:** [Compras](../error-messages.md#errores-compras).

**Controles que debe usar:** Botón **Exportar Excel**; opciones **Mes actual**, **Otro mes** o **Personalizado: usar filtros aplicados**; campo **Mes del reporte** y botón **Descargar**.

1. Abra la exportación, seleccione el alcance o periodo y genere el archivo.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-REP-ENT-05-EXPORT: exportar reporte](../images/compras/05-exportar-reporte.png)
