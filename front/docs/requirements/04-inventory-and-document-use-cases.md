# 4. Casos de uso Vue: inventario y documentos

## Condiciones compartidas

Actor: usuario autenticado con permisos del recurso y operación. Los campos de consulta no amplían el payload admitido; los resultados de stock, importes y conversiones son definitivos sólo cuando los confirma la API. Las [obligaciones locales](02-client-specification.md), [modos de Almacén](../modules/02-warehouse.md), [Compras](../modules/06-purchases.md) y [Salidas](../modules/07-issues.md) explican sus contratos completos.

<a id="cu-vue-006"></a>

## CU-VUE-006: mantener materiales y consumibles

**Objetivo:** crear o modificar información de un artículo. **Requisitos:** RF-VUE-006, RD-VUE-001/002/003, RN-VUE-001/002; correspondencia con las operaciones `CU-ALM-*` de Materiales/Consumibles.

### Flujo principal

1. Abrir el recurso y elegir Crear o Editar una fila.
2. Alta captura nombre, proveedor, presentación, unidad, inventario, cantidad inicial y observaciones. Materiales captura base/altura cuando la unidad usa medidas; Consumibles omite dimensiones.
3. Al cambiar Materiales a piezas, se limpian medidas que ya no aplican.
4. Edición muestra proveedor, presentación, unidad y dimensiones como consulta; permite metadatos admitidos, como nombre, stock mínimo, costo y estado.
5. Guardar valida el modo y envía campos permitidos. En edición se conservan la identidad del artículo, proveedor y versiones leídas según el contrato.
6. Confirmar actualiza el listado y presenta el aviso correspondiente.

### Alternativas y postcondiciones

Registrar proveedor puede abrir el alta auxiliar y volver sin perder nombre/cantidad. Alta de artículo desde Compras fija proveedor y omite captura de stock/costo inicial. Cancelar no escribe. Conflicto conserva captura y exige recarga; una baja se confirma mediante un aviso independiente y usa la identidad de la relación con proveedor, no un ID confundido del artículo.

No se modifican existencias desde el formulario de metadatos: Ajustar es otra operación. Unitarias de formulario y `warehouse.spec.ts` comprueban payloads, medidas, permisos y recuperación.

<a id="cu-vue-007"></a>

## CU-VUE-007: capturar o editar una merma

**Objetivo:** registrar merma según su referencia o editar sus metadatos. **Requisitos:** RF-VUE-007/008, RD-VUE-003/005, RN-VUE-001/002; correspondencia `CU-ALM-10` y operaciones de Mermas.

### Flujo principal

1. Abrir Crear merma y elegir proveedor; la plantilla/material se habilita después.
2. Seleccionar la referencia. Presentación/unidad y datos derivados se muestran como consulta.
3. Capturar cantidad, observaciones y pesos/referencia aplicables al modo de rollo. Se presenta la vista previa de peso neto y medidas.
4. Revisar y guardar. El editor conserva `operationId` para esa alta recuperable y envía la captura admitida.
5. Tras confirmar, se limpia la operación pendiente y se actualiza el listado.

### Dependencias y recuperación

Cambiar proveedor elimina la referencia y los datos heredados; cambiar plantilla limpia pesos/medidas anteriores. Una operación pendiente recuperada bloquea cambios para repetir exactamente su payload. Un fallo incierto no genera otra alta con un ID de operación distinto: Recuperar captura repite la existente.

Si la API rechaza definitivamente un duplicado e incluye contexto suficiente, el actor puede cancelar y conservar el alta, o confirmar Abrir Agregar stock si tiene permiso. Se traslada la referencia, cantidad y observaciones; cero deja cantidad vacía. Abrir el editor no registra una entrada: requiere revisar y Guardar de nuevo.

Edición conserva pesos/medidas históricos como consulta y envía sólo metadatos y versión. `inventoryFormTest.ts`, recuperación de duplicados y `warehouse.spec.ts` comprueban estas condiciones; la transacción real permanece en la API.

<a id="cu-vue-008"></a>

## CU-VUE-008: ajustar existencias o agregar stock de merma

**Objetivo:** corregir un saldo o registrar una entrada de merma sin confundir ambas operaciones. **Requisitos:** RF-VUE-006/007/008, RD-VUE-002, RN-VUE-002.

### Flujo principal y datos

1. Abrir Ajustar stock desde una fila con permiso. El formulario conserva nombre, datos, medidas y saldo actual como consulta.
2. Capturar nuevo saldo, motivo y observaciones; el ajuste reemplaza el saldo, no suma esa cantidad.
3. Guardar con la versión originalmente leída y las identidades requeridas por el recurso.
4. Para una entrada de merma, abrir Agregar stock y capturar una cantidad positiva/observaciones; es un contrato separado con `operationId`.
5. Confirmar y actualizar el listado sólo después del resultado válido.

### Errores y resultados

Cantidad o motivo inválidos impiden enviar. Conflicto no obtiene otra versión para aceptar una captura vieja: exige revisar el saldo actualizado. Una entrada incierta conserva su payload/operación y admite recuperación; un ajuste conserva su contrato versionado. Cancelar no escribe. Los tests de stock y recuperación protegen que no se intercambien estos efectos.

<a id="cu-vue-009"></a>

## CU-VUE-009: registrar, consultar y corregir una compra

**Actor:** operador autorizado de Compras. **Requisitos:** RF-VUE-009, RD-VUE-003/005, RN-VUE-001/002; correspondencia `CU-ENT-01..12`.

### Flujo principal

1. Abrir Compras de Materiales o Consumibles y elegir Registrar.
2. Capturar proveedor, receptor, fecha de recepción, facturación/factura y observaciones. La factura depende de la opción de facturación.
3. Seleccionar artículo del proveedor, capturar cantidad/costo y agregar la partida; revisar la tabla y los importes de vista previa.
4. Repetir para más partidas. Cambiar proveedor durante el alta limpia partidas y receptor que dependían de él.
5. Guardar el encabezado y partidas admitidas; la API resuelve conversiones/importes finales.
6. Consultar un documento por ID para revisar encabezado, observaciones, partidas y totales.

### Edición, corrección y cancelación

Editar conserva el proveedor del documento y permite los campos y partidas nuevas admitidas; no reenvía partidas existentes como si fueran altas. Las observaciones del encabezado continúan editables y son distintas de observaciones históricas de otros movimientos.

Corregir una partida usa cantidad/costo del modo de corrección y una confirmación; cancelar usa su operación propia. Cancelar el aviso no escribe; un fallo mantiene el diálogo para reintento explícito. La consulta no presenta Guardar como una escritura vacía. Registrar proveedor/artículo usa el caso auxiliar, con proveedor fijado en el artículo y sin stock inicial capturado.

La evidencia permanece en `purchaseTest.ts` y `purchases.spec.ts`; los cálculos del navegador no acreditan stock o auditoría persistidos.

<a id="cu-vue-010"></a>

## CU-VUE-010: solicitar o editar una salida

**Actor:** operador con gestión del recurso. **Requisitos:** RF-VUE-010, RD-VUE-001/005, RN-VUE-001/002; correspondencia con solicitudes `CU-SAL-*`.

### Flujo principal

1. Abrir Salidas de Materiales, Consumibles o Mermas y Registrar.
2. Capturar cliente, asesor, área, solicitante, número de proyecto, fecha y observaciones.
3. Cliente condiciona asesor; área condiciona solicitante. Cambiar uno limpia la selección dependiente. La sugerencia de proyecto interno se presenta según la regla pública y no sustituye la comprobación de la API.
4. Seleccionar artículos y cantidades, y agregarlos a la captura. Materiales/Consumibles distinguen artículo y proveedor; repetir el mismo par acumula cantidad. Mermas usa su ID.
5. Revisar y Guardar; el payload contiene identidades/cantidades permitidas, no saldos o estados confiables fabricados por el cliente.

### Modos y alternativas

Antes de editar se consulta el documento por ID y se resuelve su estado actual. Pendiente permite encabezado/partidas; después del surtido sólo se permite el encabezado cuando el estado lo admite. Cancelada queda de consulta. El alta de cliente abre su formulario auxiliar y vuelve a la salida sin guardarla.

Campos inválidos o errores del servidor conservan captura. Sin permiso no se ofrece la operación. `issueTest.ts` e `issues.spec.ts` comprueban los tres recursos, dependencias, payloads y modos.

<a id="cu-vue-011"></a>

## CU-VUE-011: surtir o devolver una salida

**Actor:** usuario con permiso de surtido/devolución del recurso. **Requisitos:** RF-VUE-010, RD-VUE-005, RN-VUE-002; correspondencia con surtidos/devoluciones `CU-SAL-*`.

### Surtido

1. Consultar el documento vigente y abrir Surtir si estado/permisos lo permiten.
2. Seleccionar detalles pendientes elegibles y capturar cantidad de proyecto.
3. Revisar diferencias y enviar IDs de los detalles seleccionados con los campos del modo.
4. Proteger detalles originalmente surtidos o cancelados; desmarcar limpia sólo la captura correspondiente.
5. Confirmar el resultado y actualizar el listado/documento.

### Devolución y errores

Abrir Devolver sobre un detalle surtido. El formulario muestra cantidad surtida, devuelta y disponible; captura cantidad/observaciones propias y rechaza superar el saldo leído antes de enviar. El servidor vuelve a validar pertenencia, estado y saldo en su transacción.

El modo Devolver del editor principal es consulta; la escritura pertenece a su diálogo específico. Cancelar no escribe. Un rechazo conserva datos y no genera reintento automático. Las pruebas de Salidas cubren estados, fronteras y las tres variantes; no sustituyen la evidencia de stock real.

<a id="cu-vue-012"></a>

## CU-VUE-012: registrar una entidad desde un selector

**Actor:** usuario con lectura y alta del recurso auxiliar, además del acceso al formulario origen. **Requisitos:** RF-VUE-012, RD-VUE-001/006, RN-VUE-001/002.

### Flujo principal

1. En un selector habilitado, buscar un nombre no vacío que no coincida exactamente con una opción visible.
2. Elegir Registrar por clic o teclado. El selector emite intención con el texto, sin inventar un ID.
3. El contenedor de aplicación abre el formulario existente con el nombre precargado.
4. Completar los demás campos y Guardar. Un error mantiene el auxiliar y permite corregir/reintentar.
5. La respuesta válida devuelve el registro al formulario vivo; una opción inactiva no queda seleccionada como entidad operativa.
6. Se selecciona el ID confirmado, se conserva su etiqueta aunque aún no esté en la primera página y se renueva el catálogo.

### Casos permitidos y cancelación

Proveedor: Materiales/Consumibles y Compras. Artículo: Compras con proveedor fijado y `creationContext=goodsReceipt`. Cliente: las tres Salidas. Presentación, Unidad, Motivo, filtros y referencias de merma mantienen sólo consulta; no heredan alta por ser selectores.

Cancelar conserva la captura/selección del origen y no registra una entidad. El auxiliar no guarda también la compra/salida/artículo principal. Un formulario desmontado descarta su callback. Los [diagramas de los tres casos](../patterns/09-contextual-creation.md) y `selectCreation.spec.ts` describen coordinación y evidencia.

<a id="cu-vue-013"></a>

## CU-VUE-013: consultar movimientos y descargar reportes

**Actor:** usuario con permiso de lectura/reporte. **Requisitos:** RF-VUE-004/011/013, RN-VUE-003/005.

### Flujo principal

1. Abrir el historial del recurso o el listado cuyo reporte se necesita.
2. Aplicar texto, fechas y selectores admitidos; revisar las filas consultadas.
3. Elegir exportar. Cuando el módulo ofrece alcance, seleccionar mes actual, mes específico o filtros aplicados.
4. Validar el mes requerido antes de solicitar el archivo; enviar el alcance sin paginación.
5. Recibir un archivo válido y permitir su descarga con el nombre informado por el servidor o el nombre de reserva del módulo.

### Alternativas y postcondición

Movimientos es de consulta: no modifica entradas, salidas o ajustes históricos. Un error de descarga conserva filtros/alcance y permite reintentar; un JSON de error recibido como Blob se presenta como error, no como Excel exitoso. Al cerrar/desmontar se cancela o invalida trabajo pendiente.

La actualización visible de listados puede pausarse durante editor/consulta/reporte; no reinicia una captura ni reemplaza filtros sin acción del usuario. `movements.spec.ts`, pruebas de reportes y el recorrido de sistema comprueban sus distintos niveles. Sólo abrir el XLSX real demuestra el contenido del archivo del servidor.
