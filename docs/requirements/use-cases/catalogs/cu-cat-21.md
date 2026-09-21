# `CU-CAT-21` — Consultar motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-21` |
| Nombre | Consultar motivo de ajuste. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Motivos de ajuste** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Motivos de ajuste** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Motivos de ajuste y muestra su tabla; presenta **Nuevo motivo de ajuste** como acción principal para registrar un motivo de ajuste **(ver A1)** **(ver A2)**. Además, consulta la información necesaria en la base de datos **(ver EBD)**.<br>3. **Actor:** selecciona **Nuevo motivo de ajuste**; termina `CU-CAT-21` y con esa selección dispara `CU-CAT-22` Crear motivo de ajuste. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Actor:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Motivos de ajuste; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 2 del flujo principal):**<br>1. **Actor:** selecciona **Editar registro** en una entrada; termina `CU-CAT-21` y puede iniciar `CU-CAT-23` Editar motivo de ajuste. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Motivos de ajuste.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |
