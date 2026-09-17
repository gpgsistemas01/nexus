# `CU-CAT-33` — Consultar presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-33` |
| Nombre | Consultar presentación. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Presentaciones.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Presentaciones y muestra su tabla.<br>3. **Nexus:** presenta **Nueva presentación** como acción principal para registrar una presentación.<br>4. **Administrador:** selecciona **Nueva presentación**; termina `CU-CAT-33` y con esa selección dispara `CU-CAT-34` Crear presentación. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Presentaciones; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-33` y puede iniciar `CU-CAT-35` Editar presentación. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Presentaciones.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
