# `CU-CAT-15` — Consultar presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-15` |
| Nombre | Consultar presentación. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Presentaciones** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización del actor para consultar Presentaciones y muestra su tabla **(ver EOP)**; presenta **Nueva presentación** como acción principal para registrar una presentación **(ver A1)** **(ver A2)**.<br>3. **Actor:** selecciona **Nueva presentación**; termina `CU-CAT-15` y con esa selección dispara `CU-CAT-16` Crear presentación. |
| Flujos alternativos | **A1 — Permanecer en la consulta (antes del paso 3):**<br>1. **Actor:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Presentaciones; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 2 del flujo principal):**<br>1. **Actor:** selecciona **Editar registro** en la pantalla **Presentaciones**; termina `CU-CAT-15`.<br>2. **Nexus:** inicia `CU-CAT-17` Editar presentación y vuelve a comprobar sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Presentaciones.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
