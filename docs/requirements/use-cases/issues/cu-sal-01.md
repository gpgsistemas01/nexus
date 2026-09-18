# `CU-SAL-01` — Consultar salidas de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-01` |
| Nombre | Consultar salidas de material. |
| Actor y disparador | **Actor:** Personal de almacén o Administrador del sistema. **Disparador:** necesita localizar o revisar salidas de material y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar salidas de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una salida de material.<br>5. **Actor:** selecciona la acción principal; termina `CU-SAL-01` y con esa selección dispara `CU-SAL-02` Crear salida de material. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el encabezado o los materiales, surtir o devolver material en lugar de iniciar el alta; termina `CU-SAL-01` y puede iniciar `CU-SAL-03` Editar encabezado, `CU-SAL-04` Editar detalles de material, `CU-SAL-05` Surtir material o `CU-SAL-06` Devolver material surtido. También puede iniciar `CU-SAL-07` Generar reporte de salidas de material. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta sin modificar existencias.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-001`. |
