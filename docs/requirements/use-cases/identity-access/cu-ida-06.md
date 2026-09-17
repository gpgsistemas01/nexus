# `CU-IDA-06` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-06` |
| Nombre | Crear usuario y asignar acceso. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** selecciona la acción principal para crear un usuario desde `CU-IDA-05` Consultar usuarios. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear usuario y asignar acceso **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra usuario y asignar acceso, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-004`. |
