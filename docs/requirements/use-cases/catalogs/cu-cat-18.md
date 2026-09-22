# `CU-CAT-18` — Consultar unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-18` |
| Nombre | Consultar unidad de medida. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Unidades de medida** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Unidades de medida y muestra su tabla; presenta **Nueva unidad de medida** como acción principal para registrar una unidad de medida **(ver A1)** **(ver A2)**. Además, consulta la información necesaria en la base de datos **(ver EBD)**.<br>3. **Actor:** selecciona **Nueva unidad de medida**; termina `CU-CAT-18` y con esa selección dispara `CU-CAT-19` Crear unidad de medida. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Actor:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Unidades de medida; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 2 del flujo principal):**<br>1. **Actor:** selecciona **Editar registro** en la pantalla **Unidades de medida**; termina `CU-CAT-18`.<br>2. **Nexus:** inicia `CU-CAT-20` Editar unidad de medida y vuelve a comprobar sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Unidades de medida.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
