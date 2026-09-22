# `CU-ALM-05` — Ajustar existencia de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-05` |
| Nombre | Ajustar existencia de material. |
| Actor | Administrador del sistema. |
| Disparador | Detecta o autoriza una diferencia de existencia de material y abre el ajuste de stock desde la consulta de materiales. |
| Precondiciones | 1. El actor inició sesión como Administrador del sistema.<br>2. El actor cuenta con el permiso `materials:adjust-stock`.<br>3. El recurso cuya existencia se ajustará existe. |
| Flujo principal | 1. **Actor:** selecciona el material y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma **(ver A1)**.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia; actualiza las vistas de inventario y confirma el resultado. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia del material refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-009`, `RF-ADJ-001`, `RF-ADJ-002`, `RN-002`, `RN-005`, `RN-011`, `RN-013`, `RN-030`. |
