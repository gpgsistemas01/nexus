# `CU-AUT-01` — Iniciar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-01` |
| Nombre | Iniciar sesión. |
| Actor | Usuario registrado. |
| Disparador | Necesita acceder a las capacidades de Nexus para realizar su trabajo autorizado. |
| Precondiciones | 1. La cuenta existe y está activa.<br>2. El actor no dispone de una sesión autenticada vigente. |
| Flujo principal | 1. **Actor:** abre la página de acceso.<br>2. **Nexus:** muestra el formulario de credenciales.<br>3. **Actor:** captura usuario y contraseña y pulsa **Ingresar** **(ver A1 y E1)**.<br>4. **Nexus:** comprueba la cuenta **(ver EOP)**, valida las credenciales y comprueba que la cuenta esté activa; establece las credenciales de sesión y presenta la página inicial con las opciones autorizadas. |
| Flujos alternativos | **A1 — Captura incompleta o inválida (después del paso 3):**<br>1. **Nexus:** señala los campos inválidos y conserva la captura sin enviar la solicitud de acceso.<br>2. **Actor:** corrige los campos y pulsa **Ingresar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Credenciales rechazadas (después del paso 3):**<br>1. **Nexus:** rechaza las credenciales o la cuenta no habilitada, muestra el error en el formulario y no concede acceso; termina el caso de uso.<br>**EOP — Acceso no confirmado (durante el paso 4):**<br>1. **Nexus:** muestra el fallo de conexión o disponibilidad y conserva el formulario sin abrir contenido protegido; termina el caso de uso hasta volver a comprobar el acceso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La sesión queda atribuida a la cuenta y se abre un destino protegido autorizado.<br>2. **Credenciales rechazadas:** No se concede acceso.<br>3. **Acceso no confirmado:** No se abre contenido protegido hasta volver a comprobar la sesión. |
| Requisitos relacionados | `RF-AUT-001`, `RN-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Captura, login y navegación](../../../architecture/views/processes/01-session/02-login.md).
