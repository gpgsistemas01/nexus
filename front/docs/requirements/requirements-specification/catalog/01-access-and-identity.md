# 4.1 Acceso e identidad

Las cuentas permiten acceso; las personas describen participantes del negocio.
Las asignaciones de acceso pertenecen a usuarios y las de responsabilidad a personas.
Consultar un catálogo auxiliar no concede su administración.

| ID | Requisito y criterio de aceptación | Estado del requisito de producto |
| --- | --- | --- |
| RF-AUT-001 | Una cuenta habilitada debe poder iniciar sesión con credenciales válidas; rechazar credenciales o una cuenta no habilitada no debe crear una sesión autenticada. | Implementado |
| RF-AUT-002 | El sistema debe renovar el acceso cuando la credencial de renovación sea válida y la cuenta continúe habilitada; una renovación rechazada debe conducir al cierre del acceso en ese navegador. | Implementado |
| RF-AUT-003 | El usuario debe poder cerrar su sesión en el navegador y volver a la página de acceso; para consultar contenido protegido deberá disponer nuevamente de una sesión válida. | Implementado |
| RF-IAM-001 | El Administrador del sistema del área Sistemas debe poder consultar usuarios y sus asignaciones de rol y departamento sin exponer contraseñas. | Implementado |
| RF-IAM-002 | Personal de almacén o el Administrador del sistema deben poder consultar personas y sus responsabilidades de rol y área sin concederles acceso implícito. | Implementado |
| RF-IAM-003 | El Administrador del sistema del área Sistemas debe poder consultar roles y departamentos activos para componer asignaciones de acceso; los inactivos permanecen visibles sólo en su mantenimiento. | Implementado |
| RF-IAM-004 | El Administrador del sistema del área Sistemas debe poder crear un usuario con una cuenta única y una asignación válida de rol y departamento; la persona asociada es opcional. | Implementado |
| RF-IAM-005 | El Administrador del sistema debe poder actualizar los datos admitidos y las asignaciones de acceso de un usuario como una sola operación, sin dejar asignaciones parcialmente reemplazadas. | Implementado |
| RF-IAM-006 | El Administrador del sistema debe poder cambiar la contraseña de un usuario sin revelarla en la respuesta ni en consultas posteriores; su protección se rige por `RC-SEG-001`. | Implementado |
| RF-IAM-007 | Personal de almacén o el Administrador del sistema deben poder crear una persona con identidad y asignaciones válidas, sin repetir un área ni crear por ello una cuenta de acceso. | Implementado |
| RF-IAM-008 | Personal de almacén o el Administrador del sistema deben poder actualizar los datos y asignaciones admitidos de una persona existente, conservando como máximo un rol por área. | Implementado |

## Criterios de acceso

- **CA-RF-AUT-001-1:** la cuenta está activa, dispone de una asignación de acceso
  con rol y departamento activos y, si está vinculada a una persona, esa persona está
  activa. Las asignaciones con rol o departamento inactivo no otorgan permisos ni
  permiten iniciar sesión.
- **CA-RF-AUT-001-2:** credenciales inválidas o una cuenta no habilitada no permiten
  acceso al contenido protegido.
- **CA-RF-AUT-002-1:** la renovación comprueba su credencial y la habilitación actual
  de la cuenta; no requiere que la credencial de acceso anterior siga vigente.
- **CA-RF-AUT-003-1:** el cierre termina el acceso en ese navegador; no se interpreta
  como revocación global de credenciales copiadas o sesiones de otros dispositivos.
