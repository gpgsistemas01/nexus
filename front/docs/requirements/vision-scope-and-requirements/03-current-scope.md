# 3. Alcance actual

## Incluido

| Capacidad | Operaciones incluidas | Requisitos |
| --- | --- | --- |
| Acceso e identidad | Iniciar, renovar y cerrar sesión; administrar personas, cuentas y asignaciones de acceso o responsabilidad. | [Acceso e identidad](../requirements-specification/catalog/01-access-and-identity.md). |
| Inventario | Consultar y mantener Materiales, Consumibles y Mermas; agregar stock de merma y aplicar ajustes autorizados, con historia y movimientos. | [Catálogos](../requirements-specification/catalog/02-catalogs-operational-and-commercial.md) e [inventario](../requirements-specification/catalog/03-receipts-issues-and-inventory.md). |
| Catálogos de apoyo | Administrar Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste y Estados de cumplimiento. Otros estados técnicos no son catálogos administrables vigentes. | [Catálogos](../requirements-specification/catalog/02-catalogs-operational-and-commercial.md). |
| Clientes y proveedores | Crear registros desde selectores de Almacén; consultar, editar y exportar desde las páginas de Sistemas. | [Directorio](../use-cases/directory/index.md). |
| Compras | Registrar recepciones de materiales o consumibles, editar encabezados y agregar detalles nuevos; corregir o cancelar detalles conservando importes, historia y movimientos. | [Compras](../use-cases/purchases/index.md). |
| Salidas | Crear y editar solicitudes separadas de materiales, consumibles o mermas. Surtir detalles completos; el documento puede quedar parcialmente surtido si quedan otros pendientes. Devolver sólo después de surtir la salida completa. | [Salidas](../use-cases/issues/index.md). |
| Consultas y reportes | Filtrar información y descargar reportes Excel autorizados de inventario, documentos, clientes, proveedores, personas, usuarios y movimientos. | [Consultas y reportes](../requirements-specification/catalog/04-queries-reports-and-modeled-functions.md). |

Los [campos y efectos por acción](../requirements-specification/06-operation-modes-and-effects.md)
precisan qué cambia, qué se conserva y cuándo se afecta el inventario.

## Datos y trazabilidad

| Datos del negocio | Significado y condición relevante |
| --- | --- |
| [Personas y cuentas](../requirements-specification/catalog/06-information-persistence-and-integrity.md) | La persona identifica participantes; la cuenta permite ingresar. Las responsabilidades organizacionales de la persona y los accesos de la cuenta se registran por separado. |
| [Materiales y consumibles](../requirements-specification/catalog/02-catalogs-operational-and-commercial.md) | Conservan clasificación, nombre, presentación y unidad. Los materiales admiten las dimensiones permitidas por su unidad; los consumibles carecen de dimensiones. |
| [Ofertas por proveedor](../requirements-specification/catalog/05-cross-cutting-business-policies.md#identidad-y-estado-de-registros) | Cada oferta conserva existencia, cantidad convertida, costo máximo y actividad. Otro proveedor puede ofrecer el mismo artículo sin crear otra identidad. |
| [Mermas](../requirements-specification/catalog/04-queries-reports-and-modeled-functions.md#criterios-de-captura-de-merma) | Tienen proveedor, datos físicos, pesos y existencias propios. El material de referencia sirve como plantilla; los datos históricos no se reemplazan si cambia la oferta de origen. Rollo utiliza su muestra y pesos conforme a las reglas de captura. |
| [Documentos](../requirements-specification/catalog/03-receipts-issues-and-inventory.md) | Las compras conservan proveedor, comprobante, receptor, fecha, detalles e importes; las salidas, cliente, área, asesor, solicitante y contexto de proyecto. Los asesores se eligen entre personas registradas. |
| [Cliente interno](../requirements-specification/catalog/05-cross-cutting-business-policies.md#cliente-interno) | GPG INTERNO exige asesor con responsabilidad de coordinador y el número de proyecto configurado para el área de destino. Esa responsabilidad no concede acceso al sistema. |
| [Historia y movimientos](../requirements-specification/catalog/05-cross-cutting-business-policies.md#documentos-y-trazabilidad) | Las correcciones y ajustes conservan actor, motivo y valores anteriores y nuevos. Cada movimiento tiene un origen; una salida de merma no se atribuye a una entrada específica mientras se administre como saldo. |
| [Fechas y estados](../requirements-specification/catalog/06-information-persistence-and-integrity.md) | La fecha del negocio se distingue de la fecha técnica de registro. Los estados describen el proceso y no se deducen del momento de creación ni del formulario abierto. |

Los tres contextos de inventario permanecen separados en documentos, consultas,
selectores y reportes. Conservar la historia también implica proteger relaciones
previas cuando un registro se desactiva o una operación se cancela.

## Necesidades de calidad

| Necesidad | Resultado esperado |
| --- | --- |
| [Integridad](../requirements-specification/catalog/06-information-persistence-and-integrity.md) | Conservar relaciones, cantidades, estados e historia ante cambios simultáneos; un rechazo no deja documentos, stock o costos modificados parcialmente. |
| [Seguridad](../requirements-specification/catalog/07-product-operation-and-quality.md) | Proteger credenciales y datos, rechazar operaciones no autorizadas y evitar divulgar secretos en mensajes o diagnósticos. |
| [Interacción y compatibilidad](../requirements-specification/catalog/07-product-operation-and-quality.md) | Alcanzar las acciones en pantallas angostas, comprender los errores y corregirlos sin perder el contexto. Los navegadores y dispositivos objetivo requieren acuerdo. |
| [Rendimiento y continuidad](../requirements-specification/catalog/07-product-operation-and-quality.md#objetivos-de-calidad-por-definir) | Consultar listados paginados donde corresponda. Tiempos, concurrencia, disponibilidad y recuperación necesitan medidas y responsables acordados. |
| [Diagnóstico y mantenimiento](../requirements-specification/catalog/07-product-operation-and-quality.md) | Reconocer fallos, conservar documentación útil y mantener consistencia de reglas y preparación del servicio. |
| [Cambios comprobables](../requirements-specification/catalog/07-product-operation-and-quality.md) | Aplicar cambios de datos reproducibles y verificar el comportamiento con pruebas aisladas; la cobertura disponible conserva sus límites. |

## Fuera del alcance actual

- Contabilidad, pagos, cobranza, facturación fiscal y conciliación bancaria.
- Planeación de compras, reabastecimiento automático y requisiciones de compra.
- Administración de proyectos; una salida sólo conserva su contexto de proyecto.
- Modificación de la política de permisos desde la interfaz.
- Aplicación móvil nativa, trabajo sin conexión e integraciones públicas con ERP,
  CRM o transportistas.
- Eliminación física generalizada del historial operativo.

## Condiciones para operar

Se necesitan cuentas autorizadas, catálogos vigentes, proveedores y clientes,
existencias iniciales validadas, navegador compatible y conexión con la API.
El personal registra los documentos y cantidades de los hechos del almacén;
la aplicación no comprueba físicamente las entregas. La responsabilidad de captura
y la preparación de los datos deben acordarse antes de la puesta en operación.

Las [condiciones de operación](../requirements-specification/07-interfaces-and-operating-conditions.md)
describen dependencias y recuperación. Los acuerdos pendientes están en
[Decisiones](04-open-decisions.md).
