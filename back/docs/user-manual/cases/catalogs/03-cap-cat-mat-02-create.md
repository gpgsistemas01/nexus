<a id="CAP-CAT-MAT-02-CREATE"></a>
# 3. CAP-CAT-MAT-02-CREATE — Formulario de alta

**Casos de uso:** `CU-ALM-02` — Crear material.

**Antes de empezar:** Vamos a registrar un material. Tenga los datos de la operación y confirme con quien le capacita que corresponde darlo de alta; busque primero si ya existe.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en el alta directa desde Materiales:** **Nombre**, **Buscar proveedor...**, **Buscar presentación...**,
**Buscar unidad...**, **Stock Mínimo**, **Costo Máximo**, **Base** y **Altura** cuando correspondan a la unidad, **Nuevo stock**,
**Observaciones** y **Activo**. La razón **Stock inicial** es automática. Use **Nuevo material** para
abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nuevo material** para abrir el formulario de alta. Observe los controles que va a usar:

   ![CAP-CAT-MAT-02-CREATE: formulario de alta](../../images/areas/almacen/materials/02-form-creation.png)

   La captura debe renovarse para reflejar el orden actual de identificación,
   medidas según la unidad e inventario en una sesión del entorno de prueba.

2. Complete **Datos del material** en orden: nombre, proveedor, presentación y unidad. La sección **Medidas del material** aparece para metros o litros; puede dejar ambas vacías o capturar ambas positivas. Para **Pieza** permanece oculta y no se solicitan medidas. Cambiar a pieza limpia las medidas capturadas anteriormente. Después complete **Inventario del material** y **Existencias y observaciones**.
3. Seleccione el botón **Guardar** para registrar el material.

Si ya existe la misma combinación de nombre, presentación, unidad, dimensiones y proveedor, Nexus
rechaza el alta: localice el material existente y use **Ajustar stock**; **Nuevo stock** representa
la existencia total que debe quedar, no una cantidad que se sume. Si la identidad ya existe para
otro proveedor, Nexus reutiliza el material y crea la relación de inventario con el proveedor
seleccionado.

🟦 **EXCEPCIÓN DEL PROCESO:** si abre **Nuevo material** desde el selector de una
**Nueva compra**, Nexus conserva **Nombre**, proveedor, presentación, unidad, dimensiones,
**Stock Mínimo** y **Activo**, pero oculta **Costo Máximo**, **Nuevo stock**, la razón de stock
inicial y **Observaciones**. El alta deja la oferta con existencia cero y sin costo máximo; no
genera un ajuste. Capture la **Cantidad** y el **Costo por Presentación** en el detalle de la compra:
esos valores se aplican al inventario sólo cuando guarde la compra. Consulte el
[registro de una compra](../purchases/02-cap-ent-02-create.md) para continuar ese recorrido.

El alta de material no solicita pesos de rollos nuevos. La muestra y los pesos del
sobrante se capturan al [registrar la merma](14-cap-cat-was-02-create.md).

**Compruebe el resultado:** Vuelva al listado y localice el registro guardado. Compruebe sus datos antes de continuar con otra operación.
