# `CU-CAT-12` — Consultar rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-12` |
| Nombre | Consultar rol. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Roles** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Roles** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización del actor para consultar Roles y consulta la base de datos **(ver EBD)** para mostrar su tabla; presenta **Nuevo rol** como acción principal para registrar un rol **(ver A1)** **(ver A2)**.<br>3. **Actor:** selecciona **Nuevo rol**; termina `CU-CAT-12` y con esa selección dispara `CU-CAT-13` Crear rol. |
| Flujos alternativos | **A1 — Permanecer en la consulta (antes del paso 3):**<br>1. **Actor:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Roles; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 2 del flujo principal):**<br>1. **Actor:** selecciona **Editar registro** en la pantalla **Roles**; termina `CU-CAT-12`.<br>2. **Nexus:** inicia `CU-CAT-14` Editar rol y vuelve a comprobar sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Roles.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
