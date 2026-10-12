<a id="CAP-CAT-WAS-02-CREATE"></a>
# 14. CAP-CAT-WAS-02-CREATE — Formulario de registro

**Casos de uso:** `CU-ALM-10` — Registrar merma.

**Antes de empezar:** Vamos a registrar un merma. Tenga los datos de la operación y confirme con quien le capacita que corresponde darlo de alta; busque primero si ya existe.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Buscar proveedor...**, **Buscar material de referencia...**,
**Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo
máximo unitario**, **Nuevo stock**, **Observaciones** y **Activo**. El nombre, presentación y unidad
provienen del material de referencia y la razón **Stock inicial** es automática. Use **Nueva merma**
para abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nueva merma** para abrir el formulario de registro. Observe los controles que va a usar:

   ![CAP-CAT-WAS-02-CREATE: formulario de registro](../../images/areas/almacen/waste/02-form-registration.png)

2. Elija opciones en **Buscar proveedor...** y **Buscar material de referencia...**; complete **Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo máximo unitario**, **Nuevo stock** y **Observaciones**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar la merma.

Si ya existe una merma con el mismo nombre, proveedor, ancho y largo, Nexus rechaza el alta y no
suma la existencia capturada. No registre otra merma para representar una nueva recepción:
localice el registro existente en el listado y use **Agregar stock**, que solicita una cantidad
incremental. **Ajustar stock** permanece reservado al Administrador del sistema para reemplazar el
saldo total cuando corrige una diferencia autorizada.

**Compruebe el resultado:** Vuelva al listado y localice el registro guardado. Compruebe sus datos antes de continuar con otra operación.

**Peso de la merma:** Si la presentación mostrada es **Rollo**, puede capturar
**Peso por unidad de merma (kg), sólo Rollo** con un valor mayor que cero.
Es el peso de una unidad con ese ancho y largo, no el peso total del stock.
La presentación proviene del material de referencia; otras presentaciones
mantienen el campo deshabilitado. Una merma con el mismo nombre, proveedor y
medidas ya tiene una identidad: actualícela o agregue stock, sin crear otra por
cambiar el peso. Un valor vacío significa que el peso no se ha capturado.

<a id="CAP-CAT-WAS-07-ROLL-WEIGHT"></a>
![CAP-CAT-WAS-07-ROLL-WEIGHT: peso unitario habilitado al consultar una merma de Rollo](../../images/areas/almacen/waste/07-roll-unit-weight.png)
