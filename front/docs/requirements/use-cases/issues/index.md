# Salidas: casos de uso

[Catálogo y plantilla de casos de uso](../index.md).

## Alcance de áreas

Auxiliar y Coordinador de Almacén, y Administrador del sistema, pueden consultar y
registrar salidas para todas las áreas. Las cuentas operativas sólo consultan,
crean y editan solicitudes de sus áreas asignadas y autorizadas. La regla cubre
Materiales, Consumibles y Mermas. En ediciones se autorizan tanto el área original
como el destino; no se permite trasladar un documento ajeno al área propia.

En el cliente, una única área disponible se muestra seleccionada y bloqueada en
formularios y filtros. Con varias opciones autorizadas se puede elegir. La precarga
del alta no reemplaza el área ni sus datos dependientes al editar un documento.

| Caso | Objetivo |
| --- | --- |
| [CU-SAL-01](cu-sal-01.md) | Consultar salidas de material. |
| [CU-SAL-02](cu-sal-02.md) | Crear salida de material. |
| [CU-SAL-03](cu-sal-03.md) | Editar encabezado de salida de material. |
| [CU-SAL-04](cu-sal-04.md) | Editar detalles de material de una salida. |
| [CU-SAL-05](cu-sal-05.md) | Surtir material. |
| [CU-SAL-06](cu-sal-06.md) | Devolver material surtido. |
| [CU-SAL-07](cu-sal-07.md) | Generar reporte de salidas de material. |
| [CU-SAL-08](cu-sal-08.md) | Consultar salidas de merma. |
| [CU-SAL-09](cu-sal-09.md) | Crear salida de merma. |
| [CU-SAL-10](cu-sal-10.md) | Editar encabezado de salida de merma. |
| [CU-SAL-11](cu-sal-11.md) | Editar detalles de merma de una salida. |
| [CU-SAL-12](cu-sal-12.md) | Surtir merma. |
| [CU-SAL-13](cu-sal-13.md) | Devolver merma surtida. |
| [CU-SAL-14](cu-sal-14.md) | Generar reporte de salidas de merma. |
| [CU-SAL-15](cu-sal-15.md) | Consultar salidas de consumible. |
| [CU-SAL-16](cu-sal-16.md) | Crear salida de consumible. |
| [CU-SAL-17](cu-sal-17.md) | Editar encabezado de salida de consumible. |
| [CU-SAL-18](cu-sal-18.md) | Editar detalles de consumible de una salida. |
| [CU-SAL-19](cu-sal-19.md) | Surtir consumible. |
| [CU-SAL-20](cu-sal-20.md) | Devolver consumible surtido. |
| [CU-SAL-21](cu-sal-21.md) | Generar reporte de salidas de consumible. |

## Realización y verificación del cliente

[Realización Vue](../../../architecture/views/development/frontend-technical-documentation/07-issues.md).
Pruebas de navegador: [issues.spec.ts](../../../../tests/e2e/issues.spec.ts).
