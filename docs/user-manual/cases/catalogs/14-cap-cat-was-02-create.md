<a id="CAP-CAT-WAS-02-CREATE"></a>
# 14. CAP-CAT-WAS-02-CREATE — Formulario de registro

**Casos de uso:** `CU-ALM-10` — Registrar merma.

**Antes de empezar:** Vamos a registrar una merma. Tenga los datos de la operación y confirme con quien le capacita que corresponde darlo de alta; busque primero si ya existe.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Buscar proveedor...**, **Buscar material de referencia...**,
**Stock mínimo**, **Costo máximo unitario**, **Nuevo stock**, **Observaciones**,
**Activo** y, para Rollo, **Peso del cono de la merma (kg)** y **Peso de la merma con cono (kg)**. El nombre, presentación y unidad
provienen del material de referencia y la razón **Stock inicial** es automática. Use **Nueva merma**
para abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nueva merma** para abrir el formulario de registro. Observe los controles que va a usar:

   ![CAP-CAT-WAS-02-CREATE: formulario de registro](../../images/areas/almacen/waste/02-form-registration.png)

   La captura debe renovarse para mostrar el orden actual y las medidas bloqueadas
   de Rollo en una sesión del entorno de prueba.

2. En **Material de origen**, elija proveedor y material. **Datos de la merma** muestra el nombre precargado, la presentación y la unidad en sus inputs; puede corregir el nombre. No hay un resumen adicional de datos del material.
   Para **Rollo**, continúe en **Pesos de la merma**: el cono se precarga desde el proveedor y puede corregirse para esta captura. Complete **Peso de la merma con cono (kg)**; este peso corresponde al sobrante, no al rollo completo.
   En **Medidas de la merma**, ambos inputs permanecen deshabilitados. La dimensión menor se toma del material y la otra se calcula al capturar pesos válidos, conservando su orientación en **Base** o **Altura**. Ambos resultados se guardan. Si faltan referencias, complete los datos todavía no registrados en Materiales antes de continuar; no se habilita un largo manual para Rollo. En otras presentaciones capture ambas medidas.
   Complete después **Inventario de la merma** y **Existencias y observaciones**. Al borrar o invalidar pesos se limpian los resultados calculados. Después del alta las dimensiones y los pesos quedan para consulta.
3. Seleccione el botón **Guardar** para registrar la merma.

Si el aviso indica que coinciden proveedor, nombre, medidas y pesos, seleccione
**Abrir Agregar stock** en el aviso para revisar el formulario de entrada. Se
precargan la merma existente, la cantidad y las observaciones; si la cantidad inicial
era cero, capture una cantidad positiva. Revise el saldo actual y el resultante,
y seleccione **Agregar** para guardar. El intento de alta y la confirmación del
aviso no suman existencias. Cancelar el aviso conserva el formulario de alta;
un error al guardar la entrada conserva los datos del modal de Agregar stock.
Con pesos distintos puede registrar otra merma. **Ajustar stock** se usa para corregir
el saldo total con autorización del Administrador del sistema.

### Prepare los pesos del material

Al dar de alta el material de Rollo y su proveedor, capture en **Pesos del rollo completo**
el peso del cono y el peso total del rollo nuevo con cono. Esta captura también está
disponible al crear un material desde una compra. Los pesos quedan para consulta
una vez guardados; sólo se pueden completar campos que todavía no estén registrados.
La longitud y el ancho proceden de las dimensiones del material. Registrar una merma
consulta estas referencias y conserva sus propios pesos; editar el cono de la merma
no modifica el peso de referencia del proveedor.

<a id="CAP-CAT-WAS-08-REFERENCE"></a>
La captura de esta preparación corresponde al formulario de material; debe renovarse
con un material de Rollo existente en el entorno de prueba.

**Compruebe el resultado:** Vuelva al listado y localice el registro guardado. Compruebe sus datos antes de continuar con otra operación.
