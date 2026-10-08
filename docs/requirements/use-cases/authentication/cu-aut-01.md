# `CU-AUT-01` — Iniciar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-01` |
| Nombre | Iniciar sesión. |
| Actor | Usuario registrado. |
| Disparador | Necesita acceder a las capacidades de Nexus para realizar su trabajo autorizado. |
| Precondiciones | 1. La cuenta existe y está activa.<br>2. El actor no dispone de una sesión autenticada vigente. |
| Flujo principal | 1. **Actor:** abre la página de acceso.<br>2. **Nexus:** muestra el formulario de credenciales.<br>3. **Actor:** captura usuario y contraseña y selecciona «Iniciar sesión» **(ver E1)**.<br>4. **Nexus:** comprueba la cuenta **(ver EOP)**, valida las credenciales y comprueba que la cuenta esté activa; establece las credenciales de sesión y presenta la página inicial con las opciones autorizadas. |
| Excepciones | **E1 — Credenciales rechazadas (después del paso 3):**<br>1. **Nexus:** valida las credenciales, determina que son inválidas o que la cuenta no admite acceso y rechaza la solicitud sin crear la sesión; comunica el error.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar la cuenta, comunica que el acceso no se completó y no establece credenciales de sesión.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Existe una sesión autenticada atribuida a la cuenta y el usuario puede acceder únicamente a las capacidades autorizadas.<br>2. **Fallo:** No se crean credenciales de sesión ni se expone información protegida. |
| Requisitos relacionados | `RF-AUT-001`, `RN-001`. |
