# `CU-CAT-02` — Crear proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear un proveedor desde `CU-CAT-01` Consultar proveedores. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta. |
| Flujo principal | 1. **Actor:** selecciona **Nuevo proveedor** **(ver E1)**.<br>2. **Nexus:** muestra el formulario con la casilla **Activo** seleccionada inicialmente.<br>3. **Actor:** captura razón social, nombre comercial y teléfono, revisa el estado y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** valida que la información sea válida.<br>5. **Nexus:** registra proveedor, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El proveedor queda registrado con los datos y el estado elegidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-010`. |
