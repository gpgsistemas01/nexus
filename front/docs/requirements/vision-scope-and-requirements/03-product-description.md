# 3. Descripción del producto

Nexus es la aplicación web de GPG para controlar la recepción, solicitud, entrega y
devolución de materiales, consumibles y mermas. Su cliente Vue permite consultar
existencias y documentos, capturar operaciones y descargar reportes de acuerdo con
los permisos y áreas autorizados de cada cuenta.

## Relación con la operación del almacén

| Momento de la operación | Resultado que presenta la aplicación |
| --- | --- |
| Recepción de una compra | Documento con proveedor, comprobante y detalles recibidos; cantidades, costos e importes de la compra confirmada. |
| Solicitud de una salida | Documento pendiente con cliente, área, solicitante y artículos requeridos. Solicitar no equivale a entregar ni descontar existencias. |
| Surtido y devolución | Estado de cumplimiento y cantidades entregadas o devueltas, con los saldos confirmados de la operación. Las tareas se habilitan según el acceso y estado del documento. |
| Control de existencias | Materiales y consumibles con sus ofertas por proveedor; mermas con sus datos físicos y existencias propios. Los movimientos permiten consultar los hechos que explican los cambios de saldo. |
| Consulta y supervisión | Listados filtrados, folios, estados y reportes Excel del ámbito autorizado. |

El producto relaciona estos documentos con personas, cuentas, áreas, proveedores y
clientes. Una persona identifica a un participante del negocio; una cuenta permite
ingresar al sistema. Figurar como cliente, proveedor o participante en un documento
no concede acceso por sí mismo.

## Uso desde la aplicación Vue

La navegación muestra los módulos disponibles para la cuenta. Desde sus consultas,
el usuario revisa resultados y abre las acciones permitidas en formularios o diálogos.
Cuando falta un proveedor, cliente o artículo y está autorizado a registrarlo, puede
abrir el alta desde el selector y continuar con el nuevo registro seleccionado.
La captura principal conserva sus datos mientras se completa esa alta.

Los formularios presentan los campos de su operación, identifican errores corregibles
y comunican el resultado del guardado. Los listados admiten actualización de la
información sin sustituir una captura en curso. Las consultas, cambios y reportes
utilizan la información y las confirmaciones del servicio del sistema; los cálculos
mostrados durante la captura son vistas previas.

El [alcance actual](06-current-scope.md) reúne las capacidades incluidas y excluidas;
los [usuarios y partes interesadas](05-users-and-stakeholders.md) precisan quién
participa y con qué límites. Los objetivos de cada grupo se desarrollan en
[alcance funcional](08-functional-scope-by-group.md).
