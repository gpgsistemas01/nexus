<a id="CAP-CAT-MAT-04-STOCK"></a>
# 6. CAP-CAT-MAT-04-STOCK — Ajuste existencia

**Casos de uso:** `CU-CAT-05` — Ajustar existencia de material; `CU-CAT-29` — Consultar motivos de ajuste.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Catálogos e inventario](../../error-messages.md#errores-catalogos).

**Campos editables en modo ajuste:** **Seleccione una razón...**, **Nueva cantidad** y
**Observaciones**. Los datos de identidad y catálogo quedan sólo para consulta. Use la acción
**Ajustar stock** y el botón **Ajustar**.

1. En la fila del material, seleccione la acción **Ajustar stock**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-CAT-MAT-04-STOCK: ajuste existencia](../../images/materiales/04-ajuste-existencia.png)

2. Elija una opción en **Seleccione una razón...** y complete los campos **Nueva cantidad** y **Observaciones**.

   🟨 **ADVERTENCIA:** **Nueva cantidad** sustituye la existencia actual; no es una cantidad que
   Nexus agregará al inventario.

3. Revise el efecto sobre la existencia y seleccione el botón **Ajustar**.

Al finalizar, vuelva al listado y confirme que la existencia mostrada sea exactamente la cantidad
capturada. Si no puede confirmarlo, actualice el listado antes de intentar otro ajuste.
