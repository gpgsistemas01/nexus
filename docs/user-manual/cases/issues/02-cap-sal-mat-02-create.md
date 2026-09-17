<a id="CAP-SAL-MAT-02-CREATE"></a>
# 2. CAP-SAL-MAT-02-CREATE — Formulario registro

**Casos de uso:** `CU-SAL-02` — Crear salida de material.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Salidas de material](../../error-messages.md#errores-salidas-material).

**Controles que debe usar:** Botón **Nueva salida**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud:** y **Observaciones**; selector **Buscar material...**, campo **Cantidad**, botón **Agregar** y botón **Guardar**.

1. Seleccione **Nueva salida** para abrir el formulario. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-MAT-02-CREATE: formulario registro](../../images/salidas-material/02-formulario-registro.png)

2. Elija opciones en **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**.
3. Complete **Número de proyecto**, **Fecha y hora de solicitud:** y **Observaciones**.
4. Elija una opción en **Buscar material...**, complete **Cantidad** y pulse **Agregar** por cada detalle.
5. Revise los datos y seleccione **Guardar**.

Cada combinación de material y proveedor debe aparecer una sola vez. Si vuelve a agregar la misma
combinación antes de guardar, el formulario reemplaza la cantidad del renglón existente; no crea
otro renglón ni suma ambas cantidades. Capture en **Cantidad** el total que desea solicitar.
