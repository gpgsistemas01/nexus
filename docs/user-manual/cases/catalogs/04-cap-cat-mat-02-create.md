<a id="CAP-CAT-MAT-02-CREATE"></a>
# 4. CAP-CAT-MAT-02-CREATE — Formulario alta

**Casos de uso:** `CU-ALM-02` — Crear material.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en el alta directa desde Materiales:** **Nombre**, **Buscar proveedor...**, **Buscar presentación...**,
**Buscar unidad...**, **Stock Mínimo**, **Costo Máximo**, **Base**, **Altura**, **Nueva cantidad**,
**Observaciones** y **Activo**. La razón **Stock inicial** es automática. Use **Nuevo material** para
abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nuevo material** para abrir el formulario de alta. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-MAT-02-CREATE: formulario alta](../../images/materials/02-form-creation.png)

2. Complete **Nombre**; elija opciones en **Buscar proveedor...**, **Buscar presentación...** y **Buscar unidad...**; capture **Stock Mínimo**, **Costo Máximo**, **Base**, **Altura**, **Nueva cantidad** y **Observaciones**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar el material.

Si ya existe la misma combinación de nombre, presentación, unidad, dimensiones y proveedor, Nexus
rechaza el alta: localice el material existente y use **Ajustar stock**; **Nueva cantidad** representa
la existencia total que debe quedar, no una cantidad que se sume. Si la identidad ya existe para
otro proveedor, Nexus reutiliza el material y crea la relación de inventario con el proveedor
seleccionado.

🟦 **EXCEPCIÓN DEL PROCESO:** si abre **Nuevo material** desde el selector de una
**Nueva compra**, Nexus conserva **Nombre**, proveedor, presentación, unidad, dimensiones,
**Stock Mínimo** y **Activo**, pero oculta **Costo Máximo**, **Nueva cantidad**, la razón de stock
inicial y **Observaciones**. El alta deja la oferta con existencia cero y sin costo máximo; no
genera un ajuste. Capture la **Cantidad** y el **Costo por Presentación** en el detalle de la compra:
esos valores se aplican al inventario sólo cuando guarde la compra. Consulte el
[registro de una compra](../purchases/02-cap-ent-02-create.md) para continuar ese recorrido.
