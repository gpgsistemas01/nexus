# `CU-ALM-09` — Consultar mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-09` |
| Nombre | Consultar mermas. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta el listado con sus existencias, la acción principal para registrar una merma y la opción **Exportar Excel**.<br>5. **Actor:** selecciona la acción principal; termina `CU-ALM-09` y con esa selección dispara `CU-ALM-10` Registrar merma. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar o ajustar la existencia de la merma en lugar de iniciar el alta; termina `CU-ALM-09` y puede iniciar `CU-ALM-11` Editar merma, `CU-ALM-12` Ajustar existencia de merma o `CU-ALM-13` Generar reporte de mermas. Para generar el reporte selecciona **Exportar Excel** y conserva los filtros de la consulta. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de existencias de merma.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-004`. |
