# `CU-CAT-01` — Consultar proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar proveedores. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar proveedores y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar proveedores **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar un proveedor.<br>5. **Actor:** selecciona la acción principal; termina `CU-CAT-01` y con esa selección dispara `CU-CAT-02` Crear proveedor. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de proveedores autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-002`. |
