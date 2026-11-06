# `CU-SAL-17` — Editar encabezado de salida de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-17` |
| Nombre | Editar encabezado de salida de consumible. |
| Actor | Usuario autorizado de área operativa, Personal de almacén o Administrador del sistema. |
| Puntos de extensión | Selección de Cliente durante el paso 3, cuando el actor autorizado no encuentra el registro; el alta contextual `CU-CAT-06` devuelve el cliente seleccionado. |
| Disparador | Detecta datos que debe corregir en el encabezado de una salida de consumible y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. La salida de consumibles no está cancelada y su estado admite edición de encabezado.<br>5. El área del documento y el área de destino pertenecen al alcance autorizado de la sesión. |
| Flujo principal | 1. **Actor:** selecciona la salida de consumible y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y los campos permitidos; conserva los detalles fuera de edición.<br>3. **Actor:** revisa o cambia Cliente y Área dentro de su alcance autorizado **(ver A2)**.<br>4. **Nexus:** muestra asesores según el cliente y solicitantes según el área. Cambiar Cliente limpia Asesor y Número de proyecto; cambiar Área limpia Solicitante y Número de proyecto. Para GPG INTERNO sugiere el proyecto configurado para el área.<br>5. **Actor:** completa los campos de encabezado permitidos y pulsa **Actualizar** **(ver A1)**.<br>6. **Nexus:** valida el estado y los datos vigentes, actualiza sólo el encabezado y confirma; conserva cantidades, existencias y movimientos **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 5):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Actualizar**; continúa en el paso 6 del flujo principal.<br>**A2 — Cliente no registrado (durante la selección del paso 3):**<br>1. **Actor:** busca el cliente y pulsa **Registrar cliente**, si tiene autorización.<br>2. **Nexus:** conserva la captura principal y abre el formulario de `CU-CAT-06` con el contexto de la operación.<br>3. **Actor:** completa el alta de cliente mediante ese caso o cancela el formulario auxiliar.<br>4. **Nexus:** retoma el formulario de origen; selecciona el registro confirmado si está activo y conserva la selección previa si se cancela o se crea inactivo. Continúa en el paso 4 del flujo principal sin guardar el documento principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 6):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 6):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RN-034`, `RF-ISS-005`, `RN-019`, `RN-035`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Salida: apertura, modos y escritura](../../../architecture/views/processes/07-issues/01-issue-open-save.md).
