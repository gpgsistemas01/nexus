# `CU-SAL-18` — Editar detalles de consumible de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-18` |
| Nombre | Editar detalles de consumible de una salida. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Necesita agregar o corregir los detalles de consumible que todavía pueden modificarse en una salida y abre los detalles. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida de consumibles está pendiente y ninguno de sus detalles ha sido surtido. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra los consumibles actuales, cantidades y acciones permitidas.<br>3. **Actor:** modifica la cantidad de un renglón existente o selecciona consumible, proveedor y cantidad para un detalle nuevo y selecciona «Agregar» **(ver A1)**.<br>4. **Nexus:** valida los datos del renglón y refleja la adición o modificación en la tabla de detalles.<br>5. **Actor:** repite la operación para cada detalle necesario, revisa la tabla y confirma los cambios.<br>6. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados; actualiza los detalles sin descontar existencias y confirma el resultado **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta datos incompletos o que no cumplen las reglas del caso y señala qué debe corregirse, sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 3 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 6 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan los consumibles y cantidades confirmados.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RN-034`, `RF-ISS-006`. |
