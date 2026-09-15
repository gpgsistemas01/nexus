# 4.1 Acceso e identidad

La descomposición conserva `RF-AUT-001`, `RF-AUT-002` y `RF-IAM-001` a `RF-IAM-003`
para la primera obligación observable de su alcance original. Cerrar sesión y las
mutaciones antes agrupadas reciben identificadores nuevos; ningún ID se reasigna a otro
recurso.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-AUT-001 | Una cuenta activa debe poder iniciar sesión con credenciales válidas; una credencial inválida no debe crear una sesión autenticada. | Implementado | `src/routes/api/authApiRoute.js`, `src/routes/web/auth/loginWebRoute.js` |
| RF-AUT-002 | Una sesión vigente debe poder renovarse reemplazando las credenciales correspondientes. | Implementado | `src/routes/web/auth/refreshWebRoute.js` |
| RF-AUT-003 | Una sesión autenticada debe poder cerrarse invalidando las credenciales correspondientes. | Implementado | `src/routes/web/auth/logoutWebRoute.js` |
| RF-IAM-001 | Administración debe poder consultar usuarios y sus asignaciones de rol y departamento sin exponer contraseñas. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/controllers/api/admin/userController.js` |
| RF-IAM-002 | Administración debe poder consultar personas y sus asignaciones sin concederles acceso implícito. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
| RF-IAM-003 | Administración debe poder consultar roles y departamentos activos para componer asignaciones de acceso; los inactivos permanecen visibles sólo en su mantenimiento. | Implementado | `src/routes/api/admin/roleApiRoute.js`, `src/routes/api/admin/departmentApiRoute.js` |
| RF-IAM-004 | Administración debe poder crear un usuario con una cuenta única y una asignación válida de rol y departamento; la persona asociada es opcional. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/controllers/api/admin/userController.js` |
| RF-IAM-005 | Administración debe poder actualizar los datos admitidos y reemplazar atómicamente la asignación de acceso de un usuario. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/services/admin/userService.js` |
| RF-IAM-006 | Administración debe poder cambiar la contraseña de un usuario almacenando únicamente su representación cifrada. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/services/admin/userService.js` |
| RF-IAM-007 | Administración debe poder crear una persona con identidad y asignaciones válidas, sin crear por ello una cuenta de acceso. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
| RF-IAM-008 | Administración debe poder actualizar los datos y asignaciones admitidos de una persona existente. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
