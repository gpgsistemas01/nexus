# `CU-AUT-02` — Cerrar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-02` |
| Nombre | Cerrar sesión. |
| Actor | Usuario registrado con sesión autenticada. |
| Disparador | Decide terminar su acceso a Nexus. |
| Precondiciones | 1. El actor dispone de una sesión autenticada. |
| Flujo principal | 1. **Actor:** pulsa **Cerrar sesión** en el menú de la aplicación.<br>2. **Nexus:** termina el acceso de ese navegador y dirige al actor a la página de inicio de sesión, incluso si la sesión ya había vencido **(ver EOP)**. |
| Excepciones | **EOP — Respuesta de cierre no disponible (durante el paso 2):**<br>1. **Nexus:** no devuelve una respuesta que confirme el cierre y la navegación no llega al formulario de acceso; el resultado queda sin confirmar. Termina el caso de uso y requiere comprobar de nuevo la sesión antes de acceder a contenido protegido. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La sesión queda cerrada en ese navegador; el actor debe volver a iniciar sesión para acceder al contenido protegido.<br>2. **Fallo:** El sistema no debe presentar contenido protegido sin volver a comprobar una sesión válida. |
| Requisitos relacionados | `RF-AUT-003`, `RN-001`. |

El cierre termina el acceso de ese navegador. No equivale a revocar todas las sesiones abiertas en otros dispositivos; véase [el contrato de sesión](../../../architecture/views/processes/01-session/01-bootstrap-and-session.md).

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Cierre de sesión y acceso posterior](../../../architecture/views/processes/01-session/03-logout.md).
