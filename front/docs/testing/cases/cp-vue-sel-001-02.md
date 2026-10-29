# CP-VUE-SEL-001-02 — proveedor y artículo desde una compra

## Diseño y trazabilidad

`CU-CAT-02`, `CU-ALM-02/18`, soporte de `CU-ENT-02/08`; `DP-VUE-SEL-001`. Variantes por recurso con el mismo oráculo de contexto.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SEL-001-02` | Chromium con mockPurchases nuevo por recurso; permisos de proveedor/artículo y compra sin guardar. | Observaciones Compra sin guardar; búsqueda Proveedor compra materials/consumables y Artículo nuevo materials/consumables. Presentación ROLLO, unidad Metros cuadrados; sólo Materiales 2 × 50. | Registrar proveedor desde su desplegable y guardarlo. Desde Material/Consumible abrir Registrar, comprobar nombre y proveedor fijado, completar datos y guardar. | Ambos registros quedan seleccionados con los IDs de respuesta. Alta del artículo envía el proveedor creado y `creationContext=goodsReceipt`, omite `newStock` y no registra la compra. La captura de observaciones del origen permanece. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[selectCreation.spec.ts](../../../tests/e2e/selectCreation.spec.ts), `select compras materials: crea proveedor y artículo desde el desplegable con contexto de compra` y variante `consumables`. Contextos aislados y API simulada. No demuestra alta o stock persistidos.
