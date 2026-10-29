# Escenarios y navegación

## Propósito

Esta vista relaciona objetivos del actor y rutas del cliente. Los flujos normativos
permanecen completos en [Casos de uso](../../../requirements/use-cases/index.md).
El [catálogo de pantallas](navigation-and-screens.md) identifica entrada, contenedor y
condición de acceso. Las secuencias de procesos describen la coordinación interna.

El [modelo de casos de uso](../../../requirements/use-case-model/index.md) representa actores y objetivos por recurso.

## Escenarios que condicionan el diseño

| Escenario | Preocupación arquitectónica | Realización |
| --- | --- | --- |
| Abrir una URL protegida con acceso vencido | Renovar una sola vez y conservar destino. | Router, sesión y cliente HTTP compartido. |
| Editar una fila que cambió desde su lectura | Conservar versión y captura al rechazar conflicto. | Editor, mapper y `useRecordSave`. |
| Registrar una merma con respuesta incierta | Recuperar el intento sin duplicar una entrada. | Pendiente de merma e `operationId`. |
| Crear proveedor/artículo/cliente desde selector | Mantener captura origen y seleccionar sólo alta confirmada. | Workspace y callbacks tipados. |
| Corregir, surtir o devolver un documento | Separar modos, datos permitidos y confirmación. | Coordinadores propios de Compras/Salidas. |
| Consultar tablas al cambiar de pestaña | Actualizar vencidos sin solapamiento ni perder contexto. | Consulta paginada y recarga visible. |

Cada escenario mantiene datos y oráculos en [Pruebas](../../../testing/index.md).
