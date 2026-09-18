# `CU-CAT-19` — Consultar unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-19` |
| Nombre | Consultar unidad de medida. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Unidades de medida.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Unidades de medida y muestra su tabla.<br>3. **Nexus:** presenta **Nueva unidad de medida** como acción principal para registrar una unidad de medida.<br>4. **Administrador:** selecciona **Nueva unidad de medida**; termina `CU-CAT-19` y con esa selección dispara `CU-CAT-20` Crear unidad de medida. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Unidades de medida; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-19` y puede iniciar `CU-CAT-21` Editar unidad de medida. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Unidades de medida.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
