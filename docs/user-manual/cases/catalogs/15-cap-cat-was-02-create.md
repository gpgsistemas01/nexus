<a id="CAP-CAT-WAS-02-CREATE"></a>
# CAP-CAT-WAS-02-CREATE — Formulario registro

**Casos de uso:** `CU-CAT-20` — Registrar merma.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Buscar proveedor...**, **Buscar material de referencia...**,
**Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo
máximo unitario**, **Nuevo stock**, **Observaciones** y **Activo**. El nombre, presentación y unidad
provienen del material de referencia y la razón **Stock inicial** es automática. Use **Nueva merma**
para abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nueva merma** para abrir el formulario de registro. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-WAS-02-CREATE: formulario registro](../../images/mermas/02-formulario-registro.png)

2. Elija opciones en **Buscar proveedor...** y **Buscar material de referencia...**; complete **Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo máximo unitario**, **Nuevo stock** y **Observaciones**, y revise la casilla **Activo**.
3. Seleccione el botón **Guardar** para registrar la merma.

Si ya existe una merma con el mismo nombre, proveedor, ancho y largo, Nexus rechaza el alta y no
suma la existencia capturada. Localice esa merma en el listado y use **Ajustar stock**; **Nuevo
stock** representa la existencia total que debe quedar, no una cantidad que se agregue al valor
actual.
