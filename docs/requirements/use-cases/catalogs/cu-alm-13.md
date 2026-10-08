# `CU-ALM-13` — Agregar existencia de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-13` |
| Nombre | Agregar existencia de merma. |
| Actor | Personal de almacén; Administrador del sistema. |
| Disparador | Recibe o identifica una cantidad adicional de una merma ya registrada y selecciona **Agregar stock**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para agregar existencias de merma.<br>3. La merma existe. |
| Flujo principal | 1. **Actor:** abre **Agregar stock** sobre una merma **(ver E1)**.<br>2. **Nexus:** abre un modal específico para la operación; muestra la identidad y la existencia actual como información de sólo lectura y solicita la cantidad a agregar y observaciones opcionales del documento de entrada.<br>3. **Actor:** captura una cantidad positiva, registra la nota si corresponde y confirma **(ver A1)**.<br>4. **Nexus:** suma la cantidad y crea un documento individual de entrada con folio, actor, observaciones, cantidad y saldos, vinculado a su movimiento de entrada, como una sola operación, sin cambios parciales; cierra el modal, actualiza el listado y confirma **(ver EOP)**. |
| Flujos alternativos | **A1 — Cantidad inválida (después del paso 3):**<br>1. **Nexus:** señala que la cantidad debe ser positiva y conserva la existencia sin cambios.<br>2. **Actor:** corrige y confirma; continúa en el paso 3 del flujo principal, o cancela y termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la operación y comunica que el actor no está autorizado, sin modificar datos.<br>2. **Actor:** recibe el aviso; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4):**<br>1. **Nexus:** comunica el fallo, conserva la existencia anterior y no registra una entrada ni un movimiento parcial.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia anterior aumenta exactamente en la cantidad capturada.<br>2. **Éxito:** El documento individual de entrada queda vinculado al historial común de movimientos de merma.<br>3. **Fallo:** No quedan cambios parciales. |
| Requisitos relacionados | `RF-MER-010`, `RN-002`, `RN-005`, `RN-013`, `RN-033`. |
