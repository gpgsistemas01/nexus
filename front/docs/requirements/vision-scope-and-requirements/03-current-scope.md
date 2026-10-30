# 3. Alcance y condiciones de uso

## Alcance funcional

El producto incluye las [funciones descritas](01-product-overview.md#funciones-principales)
para Materiales, Consumibles y Mermas. Sus capacidades vigentes, parciales,
modeladas o propuestas se identifican por estado en el
[catálogo de requisitos](../requirements-specification/catalog/index.md).

La administración de catálogos auxiliares se limita a los seis indicados en
[Funciones principales](01-product-overview.md#funciones-principales). Otros
estados técnicos no son catálogos administrables vigentes.

## Fuera del alcance actual

- Contabilidad, pagos, cobranza, facturación fiscal y conciliación bancaria.
- Planeación de compras, reabastecimiento automático y requisiciones de compra.
- Administración de proyectos; una salida sólo conserva su contexto de proyecto.
- Modificación de la política de permisos desde la interfaz.
- Aplicación móvil nativa, trabajo sin conexión e integraciones públicas con ERP,
  CRM o transportistas.
- Eliminación física generalizada del historial operativo.

## Datos y trazabilidad

| Información del negocio | Datos y relaciones principales |
| --- | --- |
| Personas y cuentas | Participantes del negocio, cuentas de ingreso, responsabilidades organizacionales y asignaciones de acceso. |
| Materiales y consumibles | Clasificación, nombre, presentación y unidad; dimensiones de materiales cuando corresponden. Los consumibles carecen de dimensiones. |
| Ofertas de proveedor | Artículo y proveedor asociados, existencia, cantidad convertida, costo máximo y actividad. Un artículo puede tener ofertas de varios proveedores. |
| Mermas | Material de referencia, proveedor, datos físicos, pesos y existencias propios; muestra del rollo completo cuando la presentación es Rollo. |
| Compras | Proveedor, comprobante, receptor, fecha, observaciones, detalles recibidos, cantidades, costos e importes. |
| Salidas | Cliente, área, asesor, solicitante, número de proyecto, fecha, observaciones y detalles con cantidades solicitadas, surtidas y devueltas. Asesor y solicitante son personas registradas. |
| Historia | Documentos de origen, movimientos, correcciones, cancelaciones, devoluciones y ajustes relacionados, con sus fechas y estados. |

El [glosario](../business-glossary.md) define los conceptos y el
[modelo de dominio](../domain-model/index.md), sus relaciones. Las condiciones
sobre identidad, datos históricos, cliente interno, saldos y fechas se especifican
en [Políticas del negocio](../requirements-specification/catalog/05-cross-cutting-business-policies.md)
e [Integridad](../requirements-specification/catalog/06-information-persistence-and-integrity.md).

## Necesidades de calidad

Las condiciones verificables se agrupan en
[Operación y calidad](../requirements-specification/catalog/07-product-operation-and-quality.md)
y [Requisitos de datos](../requirements-specification/catalog/06-information-persistence-and-integrity.md).
La interacción y recuperación del navegador se detallan en los
[requisitos del cliente](../requirements-specification/client-specification.md).
Los objetivos de servicio aún por acordar figuran en [Decisiones](04-open-decisions.md).

## Supuestos, restricciones y dependencias

La operación supone que el personal autorizado registra documentos y cantidades
correspondientes a los hechos del almacén. La responsabilidad de captura y la
validación de cuentas, catálogos y existencias iniciales requieren acuerdo antes
de la puesta en operación.

La aplicación depende de un navegador compatible y del servicio API. Sus
intercambios, datos de preparación y respuestas ante fallos se definen en
[Condiciones de operación](../requirements-specification/07-interfaces-and-operating-conditions.md).
Los cálculos mostrados durante la captura son estimaciones; el servicio confirma
los saldos e importes según los requisitos del cliente.
