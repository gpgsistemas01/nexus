# `CU-CAT-10` — Crear área

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-10` |
| Nombre | Crear área. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Nueva área** en `CU-CAT-09` Consultar área. |
| Precondiciones | 1. El actor inició sesión y tiene autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Áreas**. |
| Flujo principal | 1. **Actor:** abre la pantalla **Áreas** y selecciona **Nueva área** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Actor:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Áreas; confirma y refresca la tabla de Áreas **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Áreas queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Alta y edición de catálogos](../../../architecture/views/processes/03-catalogs-and-directory/01-catalog-record-save.md).
