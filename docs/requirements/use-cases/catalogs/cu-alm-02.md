# `CU-ALM-02` — Crear material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-02` |
| Nombre | Crear material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear un material desde `CU-ALM-01` Consultar materiales. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear material **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna, y los datos de inventario requeridos; después confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones **(ver A2)**.<br>5. **Nexus:** registra la identidad o reutiliza la existente, crea la oferta del proveedor, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Identidad ya registrada (después del paso 4):**<br>1. **Actor:** revisa el material coincidente que Nexus presenta.<br>2. **Nexus:** si ya existe la relación con el mismo proveedor, rechaza el alta sin modificar la existencia e indica que debe ajustarse el inventario existente; termina el caso de uso.<br>3. **Nexus:** si la identidad sólo existe para otro proveedor, reutiliza el material y crea la nueva relación proveedor-material; continúa en el paso 5 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con presentación, unidad y relaciones válidas.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-006`. |
