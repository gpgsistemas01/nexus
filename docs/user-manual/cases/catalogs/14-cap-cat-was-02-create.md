<a id="CAP-CAT-WAS-02-CREATE"></a>
# 14. CAP-CAT-WAS-02-CREATE — Formulario de registro

**Casos de uso:** `CU-ALM-10` — Registrar merma.

**Antes de empezar:** Vamos a registrar una merma. Tenga los datos de la operación y confirme con quien le capacita que corresponde darlo de alta; busque primero si ya existe.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en modo alta:** **Buscar proveedor...**, **Buscar material de referencia...**,
**Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo
máximo unitario**, **Nuevo stock**, **Observaciones**, **Activo** y, para Rollo, **Peso del cono por unidad (kg)** y **Peso total por unidad con cono (kg)**. El nombre, presentación y unidad
provienen del material de referencia y la razón **Stock inicial** es automática. Use **Nueva merma**
para abrir el formulario y **Guardar** para confirmarlo.

1. Seleccione el botón **Nueva merma** para abrir el formulario de registro. Observe los controles que va a usar:

   ![CAP-CAT-WAS-02-CREATE: formulario de registro](../../images/areas/almacen/waste/02-form-registration.png)

2. Elija opciones en **Buscar proveedor...** y **Buscar material de referencia...**; complete **Ancho confirmado de la merma (m)**, **Largo real de la merma (m)**, **Stock mínimo**, **Costo máximo unitario**, **Nuevo stock** y **Observaciones**, y revise la casilla **Activo**.
   Si la presentación es **Rollo**, revise la referencia del cono. El campo **Peso del cono por unidad (kg)** se precarga desde el material; si el cono de esta merma cambia, edite ese mismo campo. Complete el **Peso total por unidad con cono (kg)** y compruebe el neto calculado.
   En **Longitud de la merma**, elija **Medida** para capturar el largo real o **Estimada por peso** para calcularlo con la muestra. Si desconoce los pesos, deje ambos pesos vacíos y capture el largo medido. Después del alta los pesos y el método serán de consulta.
3. Seleccione el botón **Guardar** para registrar la merma.

Si el aviso indica que coinciden proveedor, nombre, medidas y pesos, seleccione
**Agregar esta cantidad al stock existente**. Revise la cantidad precargada y confirme
**Agregar stock** para registrar la entrada; el intento de alta no sumó existencias.
Con pesos distintos puede registrar otra merma. **Ajustar stock** se usa para corregir
el saldo total con autorización del Administrador del sistema.

### Prepare los pesos del material

Registre o edite el material de Rollo y su proveedor. En **Pesos del rollo**, capture
**Peso predeterminado del cono (kg)** y, si estimará longitudes, **Peso total del rollo
completo con cono (kg)**. La longitud y el ancho se consultan de las dimensiones del
material. En merma estos datos se consultan automáticamente. Cambiar los pesos del
material afecta sólo nuevas capturas; no modifica pesos ni largos ya registrados.

<a id="CAP-CAT-WAS-08-REFERENCE"></a>
La captura de esta preparación corresponde al formulario de material; debe renovarse
con un material de Rollo existente en el entorno de prueba.

**Compruebe el resultado:** Vuelva al listado y localice el registro guardado. Compruebe sus datos antes de continuar con otra operación.
