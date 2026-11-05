# CP-VUE-SEL-001-01 — proveedor desde la captura de inventario

## Diseño y trazabilidad

`CU-CAT-02`, soporte de `CU-ALM-02/18`; `DP-VUE-SEL-001`. Variantes Materiales y Consumibles; cancelar → error → confirmar.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SEL-001-01` | Chromium con mockWarehouse nuevo, consulta/alta de proveedor y formulario de artículo abierto; primer alta auxiliar falla y luego confirma. | Artículo Captura del artículo, cantidad 5; búsqueda Proveedor nuevo materials/consumables; razón social Empresa nueva. Alta auxiliar 503 y luego registro activo/versionado. | Buscar en Proveedor, elegir Registrar, comprobar precarga y cancelar. Volver a abrir, completar razón social, guardar y observar error; reenviar explícitamente. | Cancelar no envía POST de proveedor. El error conserva el modal y el nombre comercial. El segundo POST confirma el registro y cierra el auxiliar; el origen conserva nombre/cantidad y muestra el proveedor nuevo aunque la respuesta de opciones siga sin contenerlo. | Contexto Playwright y estado del harness descartados al terminar; sin escrituras SQL. |

## Fuente ejecutable y alcance

[selectCreation.spec.ts](../../../tests/e2e/selectCreation.spec.ts), `select materials: proveedor precargado, cancelar, error y selección tras guardar` y variante `consumables`. Contexto Playwright aislado; API simulada, sin limpieza SQL. `inventoryFormTest.ts` comprueba rechazo de inactivos y callback tras desmontaje.
