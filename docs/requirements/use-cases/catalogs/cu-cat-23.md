# `CU-CAT-23` — Editar motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-23` |
| Nombre | Editar motivo de ajuste. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Editar registro** en la pantalla **Motivos de ajuste**. |
| Precondiciones | 1. El actor inició sesión y tiene autorización para administrar catálogos.<br>2. La entrada existe en **Motivos de ajuste**. |
| Flujo principal | 1. **Actor:** abre **Motivos de ajuste** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes y únicamente los campos **Nombre** y **Activo**.<br>3. **Actor:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Motivos de ajuste; confirma y refresca la tabla de Motivos de ajuste **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Actor:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Motivos de ajuste conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |
