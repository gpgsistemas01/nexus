# `CU-CAT-30` — Consultar estados de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-30` |
| Nombre | Consultar estados de cumplimiento. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere estados de cumplimiento. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere estados de cumplimiento **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga estados de cumplimiento vigentes.<br>3. **Actor:** consulta o selecciona una opción de estados de cumplimiento.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-021`. |
