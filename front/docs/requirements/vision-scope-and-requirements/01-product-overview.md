# 1. Descripción del producto

## Propósito

Nexus es la aplicación web de GPG para controlar materiales, consumibles y mermas.
Relaciona existencias, documentos, cantidades, costos y participantes de la
operación del almacén.

## Necesidad y objetivos

Los registros dispersos dificultan conciliar existencias, explicar diferencias y
supervisar entregas. Nexus busca conservar el vínculo de cada cantidad, costo o
entrega con su documento de origen y las personas que participaron.

| Objetivo | Resultado esperado |
| --- | --- |
| Controlar existencias | Consultar el saldo de materiales, consumibles y mermas en sus contextos separados. |
| Conservar la historia | Reconocer el origen, cantidades, costos y responsables de recepciones, entregas, devoluciones y ajustes. |
| Delimitar responsabilidades | Distinguir personas de cuentas y permitir sólo operaciones y áreas autorizadas. |
| Apoyar la supervisión | Buscar documentos y descargar información operativa autorizada para revisar saldos y entregas. |

Los indicadores, línea base, metas, período de medición y responsables están en
[Decisiones pendientes](04-open-decisions.md).

## Perspectiva del producto

El cliente Vue es la interfaz web de Nexus. Permite consultar información,
capturar documentos y conocer el resultado de las operaciones mediante la API.
El servicio comprueba acceso y reglas y confirma documentos, existencias e historia.
Los [actores y responsabilidades](../requirements-specification/03-actors-and-system-responsibilities.md)
precisan esa frontera.

El almacén registra recepciones, atiende solicitudes de las áreas y recibe
las devoluciones. Personas, áreas, clientes y proveedores identifican participantes
y destinos; el número de proyecto aporta contexto a la salida. La aplicación
conserva los hechos registrados, mientras el personal realiza y comprueba la
operación física.

## Funciones principales

| Función | Resultado para el usuario |
| --- | --- |
| Acceso e identidad | Iniciar, renovar y cerrar sesión; administrar personas, cuentas y asignaciones. |
| Inventario | Consultar y mantener Materiales, Consumibles y Mermas, sus ofertas por proveedor y existencias; registrar entradas de merma y ajustes autorizados. |
| Catálogos de apoyo | Mantener Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste y Estados de cumplimiento. |
| Clientes y proveedores | Incorporar el contexto comercial de compras y salidas mediante los registros autorizados. |
| Compras | Registrar recepciones de materiales o consumibles, editar encabezados, agregar detalles y corregir o cancelar detalles conservando su historia. |
| Salidas | Solicitar materiales, consumibles o mermas, editar las solicitudes permitidas, surtirlas y registrar devoluciones. |
| Consultas y reportes | Buscar documentos y movimientos por contexto y descargar reportes Excel autorizados de inventario, compras, salidas, directorio e identidad. |

Los [usuarios y áreas](02-users-and-areas.md) describen el contexto de uso;
el [alcance](03-current-scope.md), sus límites y dependencias. Las condiciones,
campos y efectos de cada acción se especifican en
[Operaciones](../requirements-specification/06-operation-modes-and-effects.md).
