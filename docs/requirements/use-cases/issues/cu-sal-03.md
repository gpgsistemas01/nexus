# `CU-SAL-03` — Editar encabezado de salida de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-03` |
| Nombre | Editar encabezado de salida de material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en el encabezado de una salida de material y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona una salida de material y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y habilita sólo los campos permitidos por su estado.<br>3. **Actor:** modifica los datos contextuales y confirma **(ver A1)**.<br>4. **Nexus:** valida el estado, los participantes y las relaciones y actualiza el encabezado; conserva intactas las cantidades y existencias y confirma la actualización. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-005`. |
