# `CU-ALM-10` — Registrar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-10` |
| Nombre | Registrar merma. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona la acción principal para registrar una merma desde `CU-ALM-09` Consultar mermas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar merma» y selecciona primero un proveedor **(ver E1)**.<br>2. **Nexus:** carga los materiales de ese proveedor con unidad m² o metro cuadrado; excluye consumibles.<br>3. **Actor:** elige el material, completa los datos propios de la merma; para Rollo captura el peso del rollo completo con cono, el del sobrante con cono y un único peso de cono; el largo original procede del material; confirma **(ver A1)**.<br>4. **Nexus:** valida identidad, dimensiones, existencia y datos relacionados **(ver A2)**; crea la merma con sus propios datos históricos, registra su existencia inicial y confirma el alta **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta datos incompletos o que no cumplen las reglas del caso y señala qué debe corregirse, sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Merma ya registrada (después del paso 4):**<br>1. **Nexus:** detecta que ya existe la misma combinación de nombre, proveedor, ancho, largo y pesos; rechaza el alta y no modifica su existencia.<br>2. **Actor:** revisa el aviso y puede confirmar **Abrir Agregar stock**, o cancelar conservando el formulario de alta.<br>3. **Nexus:** si tiene autorización, cierra el alta y abre el modal de `CU-ALM-13` con la merma, cantidad y observaciones capturadas. Una cantidad inicial de cero deja vacío el campo para capturar un valor positivo.<br>4. **Actor:** revisa los datos y guarda el modal para registrar la entrada. El aviso no modifica existencias y el ajuste absoluto de `CU-ALM-12` no sustituye este flujo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta desde una plantilla material-proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-MER-011` a `RF-MER-013`, `RF-CAT-015`, `RF-MER-001`, `RF-MER-002`, `RF-MER-004`, `RF-MER-006` a `RF-MER-009`, `RN-020` a `RN-023`. |

El alta calcula el neto conforme a `RF-MER-011` y el largo proporcional a la muestra
conforme a `RF-MER-012` y `RF-MER-013`. Guarda la muestra en la merma sin modificar
los pesos históricos de material/proveedor.

La cantidad inicial positiva se registra mediante un documento de entrada `EME` y
su movimiento, conservando saldo anterior cero y saldo final igual a lo capturado.
Todo se confirma en una transacción. Con cantidad cero se crea únicamente la merma,
sin documento, movimiento ni consumo de folio. El alta no solicita motivo de ajuste;
las correcciones de saldo corresponden a `CU-ALM-12` y generan `AME`.

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/02-warehouse.md) describe captura, permisos de interfaz, contratos y propietarios del estado. La [cobertura por caso](../../../testing/04-use-case-coverage.md) identifica la evidencia y sus límites. Las pruebas de navegador de esta familia están en `warehouse.spec.ts, catalogs.spec.ts, records.spec.ts y movements.spec.ts`; la existencia del archivo no acredita por sí sola todos los pasos de esta ficha.

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
- [Merma: respuesta incierta y reintento](../../../architecture/views/processes/05-warehouse/02-waste-pending.md).
- [Merma duplicada: apertura de una entrada](../../../architecture/views/processes/05-warehouse/03-waste-duplicate.md).
- [Merma: selección de referencia y vista previa](../../../architecture/views/processes/05-warehouse/05-waste-preview.md).
