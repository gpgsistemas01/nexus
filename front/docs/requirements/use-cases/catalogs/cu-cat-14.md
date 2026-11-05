# `CU-CAT-14` — Editar rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-14` |
| Nombre | Editar rol. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Editar registro** en la pantalla **Roles**. |
| Precondiciones | 1. El actor inició sesión y tiene autorización para administrar catálogos.<br>2. La entrada existe en **Roles**. |
| Flujo principal | 1. **Actor:** abre **Roles** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Actor:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Roles; confirma y refresca la tabla de Roles **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Actualizar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar listado**.<br>2. **Actor:** pulsa **Cerrar y actualizar listado** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Roles conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Alta y edición de catálogos](../../../architecture/views/processes/03-catalogs-and-directory/01-catalog-record-save.md).
