# `CU-CAT-19` — Registrar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-19` |
| Nombre | Registrar merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para registrar una merma desde `CU-CAT-18` Consultar mermas. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar merma» y selecciona primero un proveedor **(ver E1)**.<br>2. **Nexus:** carga los materiales de ese proveedor que pueden utilizarse como plantilla.<br>3. **Actor:** elige el material, completa los datos propios de la merma y confirma **(ver A1)**.<br>4. **Nexus:** valida identidad, dimensiones, existencia y datos relacionados **(ver A2)**.<br>5. **Nexus:** crea la merma con sus propios datos históricos, registra su existencia inicial y confirma el alta. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Merma ya registrada (después del paso 4):**<br>1. **Actor:** revisa la merma coincidente que Nexus presenta.<br>2. **Nexus:** rechaza el alta, conserva la existencia y muestra la opción para localizar el registro existente.<br>3. **Actor:** termina `CU-CAT-19` y puede iniciar `CU-CAT-21` Ajustar existencia de merma; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta desde una plantilla material-proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-015`. |
