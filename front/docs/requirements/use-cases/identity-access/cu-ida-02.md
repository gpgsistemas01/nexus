# `CU-IDA-02` — Crear persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-02` |
| Nombre | Crear persona. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona la acción principal para crear una persona desde `CU-IDA-01` Consultar personas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear persona **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las áreas y roles disponibles.<br>3. **Actor:** captura el nombre completo; selecciona un área y un rol y selecciona **Agregar** **(ver A1)**.<br>4. **Nexus:** valida que el área y el rol sean válidos y que el área no esté repetida; incorpora la responsabilidad a la tabla.<br>5. **Actor:** repite los pasos 3 y 4 para cada responsabilidad requerida, revisa las filas de la tabla y selecciona **Guardar**.<br>6. **Nexus:** valida autorización, obligatoriedad, formato, identidad y todas las responsabilidades **(ver A2)**; registra la persona y sus responsabilidades como una sola operación, actualiza el listado y muestra la confirmación **(ver EOP)**. |
| Flujos alternativos | **A1 — Área o rol inválidos o área repetida (después del paso 3):**<br>1. **Nexus:** señala la selección inválida o el área repetida y no agrega la responsabilidad a la tabla.<br>2. **Actor:** corrige la selección y pulsa **Agregar**; continúa en el paso 4 del flujo principal.<br>**A2 — Datos finales inválidos (durante el paso 6):**<br>1. **Nexus:** señala el nombre o las responsabilidades que deben corregirse y conserva el formulario y la tabla sin guardar cambios.<br>2. **Actor:** corrige el nombre o ajusta las filas mediante Área, Rol, **Agregar** y **Quitar asignación**; revisa la tabla y pulsa **Guardar**; continúa en el paso 6 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 6):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 6):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta de persona sin crear cuenta.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-007`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Personas y responsabilidades](../../../architecture/views/processes/04-identity/01-person-responsibilities.md).
