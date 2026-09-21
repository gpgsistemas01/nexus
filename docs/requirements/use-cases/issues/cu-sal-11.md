# `CU-SAL-11` — Editar detalles de merma de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-11` |
| Nombre | Editar detalles de merma de una salida. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Necesita agregar o corregir mermas de una salida todavía modificables y abre los detalles. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra las mermas actuales, cantidades y acciones permitidas.<br>3. **Actor:** agrega o modifica mermas y confirma los cambios **(ver A1)**.<br>4. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados; actualiza los detalles sin descontar existencias y confirma el resultado. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan las mermas y cantidades confirmadas.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-005`. |
