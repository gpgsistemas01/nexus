# 1. Acceso y sesión

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `auth`. El [corte de componentes](../../logical/components/01-access.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `LoginPage` | Conectar formulario, éxito y navegación al destino autorizado. |
| `LoginForm` | Presentar captura, errores, pendiente y eventos; sin HTTP. |
| `useLoginForm` | VeeValidate, interacción, preferencia de nombre, envío y desmontaje. |
| `loginRequest` | Normalizar credenciales/errores y comprobar SUCCESS_LOGIN. |
| `createAuthSession` | Identidad readonly y carga compartida por aplicación. |
| Router y `apiClient` | Guarda/retorno y renovación coordinada, con contratos separados. |

## Datos y operaciones

| Dato/operación | Contrato |
| --- | --- |
| Usuario/contraseña | Nombre admite trim; contraseña conserva todos sus caracteres. |
| Recordar usuario | Sólo `nexus.rememberedUser`, después del éxito; Storage opcional. |
| Login | POST `/api/auth/login`, sin intentar refresh ante credenciales rechazadas. |
| Sesión | GET `/api/auth/me`; refresh POST ante 401 protegido, máximo un reintento por petición. |
| Cierre | Formulario POST `/cerrar-sesion`; navegador/API administran cookies HttpOnly. |
| Error | Campo, credencial genérica, límite de intentos o indisponibilidad; conservar retorno interno. |

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Captura, rechazo y éxito | [Captura, rechazo y éxito](../../processes/04-login.md) |
| Guarda, refresh y recuperación | [Guarda, refresh y recuperación](../../processes/01-bootstrap-and-session.md) |
| Cierre y acceso posterior | [Cierre y acceso posterior](../../processes/21-logout.md) |

Los [estados de captura y documento](../../logical/document-states.md) complementan las secuencias; los [patrones](../design-and-construction-patterns/index.md) conservan modelo general y aplicación específica.

## Evidencia

login.spec.ts, sessionRecovery.spec.ts, apiClientTest.ts, useLoginFormTest.ts y sistema representativo. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
