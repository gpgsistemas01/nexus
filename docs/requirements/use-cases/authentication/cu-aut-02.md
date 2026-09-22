# `CU-AUT-02` — Cerrar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-02` |
| Nombre | Cerrar sesión. |
| Actor | Usuario registrado con sesión autenticada. |
| Disparador | Decide terminar su acceso a Nexus. |
| Precondiciones | 1. El actor dispone de una sesión autenticada. |
| Flujo principal | 1. **Actor:** selecciona «Cerrar sesión» **(ver E1)**.<br>2. **Nexus:** elimina las credenciales y el destino de retorno conservados en el navegador; dirige al actor fuera del área protegida y confirma el cierre. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El navegador deja de conservar las credenciales de acceso de la sesión.<br>2. **Fallo:** El sistema no debe presentar contenido protegido sin volver a comprobar una sesión válida. |
| Requisitos relacionados | `RF-AUT-003`, `RN-001`. |
