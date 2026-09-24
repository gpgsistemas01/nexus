# `CU-ALM-16` — Agregar existencia de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-16` |
| Nombre | Agregar existencia de merma. |
| Actor | Personal de almacén; Administrador del sistema. |
| Disparador | Recibe o identifica una cantidad adicional de una merma ya registrada y selecciona **Agregar stock**. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con `wastes:add-stock`.<br>3. La merma existe. |
| Flujo principal | 1. **Actor:** abre **Agregar stock** sobre una merma.<br>2. **Nexus:** abre un modal específico para la operación; muestra la identidad y la existencia actual como información de sólo lectura y solicita la cantidad a agregar y observaciones opcionales del documento de entrada.<br>3. **Actor:** captura una cantidad positiva, registra la nota si corresponde y confirma.<br>4. **Nexus:** suma la cantidad y crea un documento individual de entrada con folio, actor, observaciones, cantidad y saldos, vinculado al movimiento histórico `ENTRY`, en una sola transacción; cierra el modal, actualiza el listado y confirma. |
| Flujos alternativos | **A1 — Cantidad inválida:** Nexus rechaza cantidades vacías, iguales a cero o negativas sin modificar la existencia. |
| Excepciones | **E1 — Acceso rechazado:** Nexus rechaza la operación sin cambios.<br>**EBD — Error de persistencia:** Nexus revierte existencia y movimiento como una sola unidad. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia anterior aumenta exactamente en la cantidad capturada.<br>2. **Éxito:** El documento individual de entrada queda vinculado al historial común de movimientos de merma.<br>3. **Fallo:** No quedan cambios parciales. |
| Requisitos relacionados | `RF-MER-010`, `RN-002`, `RN-005`, `RN-013`, `RN-033`. |
