# `CU-ALM-10` — Registrar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-10` |
| Nombre | Registrar merma. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona la acción principal para registrar una merma desde `CU-ALM-09` Consultar mermas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** selecciona **Nueva merma** **(ver E1)**.<br>2. **Nexus:** abre el formulario de merma y presenta los proveedores disponibles.<br>3. **Actor:** selecciona el proveedor de la merma.<br>4. **Nexus:** carga los materiales de ese proveedor con unidad m² o metro cuadrado y excluye consumibles; un cambio de proveedor limpia la referencia anterior.<br>5. **Actor:** elige el material de referencia y completa nombre, datos físicos, stock mínimo, costo máximo, estado, existencia inicial y observaciones. Para Rollo captura peso del rollo completo con cono, peso del sobrante con cono y un único peso del cono; el largo original procede del material.<br>6. **Nexus:** presenta los datos de la referencia y la vista previa. Para Rollo calcula peso neto y dimensiones sin edición manual; para otras presentaciones utiliza las dimensiones capturadas.<br>7. **Actor:** revisa los datos y cálculos y pulsa **Guardar** **(ver A1)**.<br>8. **Nexus:** valida identidad, dimensiones y datos relacionados **(ver A2 y E2)**; crea la merma con datos históricos propios. Si la cantidad es positiva, registra una entrada EME y su movimiento; con cero sólo crea la merma, sin documento ni folio de entrada. Confirma el registro y actualiza el inventario **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 7):**<br>1. **Nexus:** señala los campos o pesos inválidos y conserva la captura sin registrar la merma.<br>2. **Actor:** corrige los datos, revisa la vista previa y pulsa **Guardar**; continúa en el paso 8 del flujo principal.<br>**A2 — Merma ya registrada (durante el paso 8):**<br>1. **Nexus:** informa que la identidad ya existe y rechaza el alta sin sumar stock. Si el actor puede agregar stock, ofrece **Abrir Agregar stock**; en otro caso termina este intento conservando la captura.<br>2. **Actor:** si se ofrece la acción, pulsa **Abrir Agregar stock**, o pulsa **Cancelar** para conservar el alta y termina el caso sin registrar una entrada.<br>3. **Nexus:** si se eligió abrir, sustituye el alta por el modal de `CU-ALM-13`, con merma, cantidad y observaciones precargadas; una cantidad inicial cero queda vacía. Termina este caso y continúa en el paso 3 de `CU-ALM-13`; abrirlo no modifica existencias. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 8):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Resultado de la operación incierto (durante el paso 8):**<br>1. **Nexus:** conserva la captura protegida y muestra **Recuperar captura**; impide cambiar los datos de la intención pendiente y no anuncia un resultado confirmado.<br>2. **Actor:** pulsa **Recuperar captura**, continuando en el paso 8 con los mismos datos y la misma operación, o cierra el modal y termina el caso conservando la recuperación pendiente.<br>**E2 — Recuperación local no disponible (durante el paso 8):**<br>1. **Nexus:** informa que no pudo preparar el almacenamiento de recuperación y no envía una nueva operación; mantiene el formulario sin anunciar éxito; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta desde una plantilla material-proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-MER-011` a `RF-MER-013`, `RF-CAT-015`, `RF-MER-001`, `RF-MER-002`, `RF-MER-004`, `RF-MER-006` a `RF-MER-009`, `RN-020` a `RN-023`. |

Para Rollo, revise el neto y el largo calculados a partir de los pesos capturados del rollo completo, del sobrante y del cono. El material de referencia conserva sus datos.

Los ajustes posteriores de saldo corresponden a `CU-ALM-12` y generan `AME`.

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
- [Merma: respuesta incierta y reintento](../../../architecture/views/processes/05-warehouse/02-waste-pending.md).
- [Merma duplicada: apertura de una entrada](../../../architecture/views/processes/05-warehouse/03-waste-duplicate.md).
- [Merma: selección de referencia y vista previa](../../../architecture/views/processes/05-warehouse/05-waste-preview.md).
