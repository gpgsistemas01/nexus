# `CU-SAL-04` — Editar detalles de material de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-04` |
| Nombre | Editar detalles de material de una salida. |
| Actor | Usuario autorizado de área operativa, Personal de almacén o Administrador del sistema. |
| Disparador | Necesita agregar o corregir los detalles de material que todavía pueden modificarse en una salida y abre los detalles. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles.<br>5. El área del documento y el área de destino pertenecen al alcance autorizado de la sesión. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra los materiales actuales, cantidades y acciones permitidas.<br>3. **Actor:** para sustituir una cantidad, usa **Eliminar detalle** sobre la fila modificable y vuelve a seleccionar un material y su proveedor con la cantidad correcta; para agregar, selecciona un material y su proveedor, captura la cantidad y pulsa **Agregar** **(ver A1)**.<br>4. **Nexus:** refleja la eliminación local o valida e incorpora la adición; acumula la misma selección conforme a sus reglas, sin guardar todavía el documento.<br>5. **Actor:** repite la operación para cada detalle necesario, revisa la tabla y pulsa **Actualizar**.<br>6. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados **(ver A2)**; actualiza los detalles sin descontar existencias y confirma el resultado **(ver EOP)**. |
| Flujos alternativos | **A1 — Detalle inválido (después del paso 3):**<br>1. **Nexus:** señala la selección o cantidad inválida y conserva la tabla sin incorporar esa adición.<br>2. **Actor:** corrige el detalle y pulsa **Agregar**; continúa en el paso 4 del flujo principal.<br>**A2 — Conjunto final de detalles inválido (durante el paso 6):**<br>1. **Nexus:** señala las filas inválidas o la ausencia de detalles y conserva la captura sin actualizar la salida.<br>2. **Actor:** corrige la tabla mediante **Eliminar detalle** y **Agregar**, revisa las filas y pulsa **Actualizar**; continúa en el paso 6 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 6):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 6):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan los materiales y cantidades confirmados.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-006`, `RN-019`, `RN-035`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Salida: apertura, modos y escritura](../../../architecture/views/processes/07-issues/01-issue-open-save.md).
