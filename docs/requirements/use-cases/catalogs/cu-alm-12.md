# `CU-ALM-12` — Ajustar existencia de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-12` |
| Nombre | Ajustar existencia de merma. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta o autoriza una diferencia de existencia de merma y abre el ajuste de stock desde la consulta de mermas. |
| Participación de actor y sistema | **Actor:** selecciona el inventario, captura el ajuste y confirma.<br>**Nexus:** muestra la existencia, valida, registra el ajuste y actualiza inventario. |
| Precondiciones | 1. El actor inició sesión como administrador del sistema.<br>2. El actor cuenta con el permiso `wastes:adjust-stock`.<br>3. El recurso cuya existencia se ajustará existe. |
| Flujo principal | 1. **Actor:** selecciona el registro de merma y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma **(ver A1)**.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia.<br>5. **Nexus:** actualiza las vistas de inventario y confirma el resultado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia de la merma refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-018`. |
