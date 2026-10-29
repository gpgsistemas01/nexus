# Modelo de casos de uso

## Alcance y notación

Este modelo representa objetivos del negocio y forma parte de los requisitos.
Arquitectura lo utiliza como referencia para la vista de escenarios; las llamadas
entre componentes y los detalles de implementación pertenecen a sus procesos.

Los objetivos están descritos íntegramente en las [94 fichas locales](../use-cases/index.md).
Las figuras agrupan objetivos por recurso dentro del límite Nexus. La
[leyenda visual](../../architecture/views/diagram-reading.md#casos-de-uso) explica actores, óvalos,
asociación, generalización, inclusión y extensión. El actor del recurso se conecta
con su consulta; desde ella, enlaces simples conectan las operaciones disponibles.
Las asociaciones directas adicionales identifican participaciones específicas.
Los enlaces consulta–operación son una convención de acceso de esta vista resumida,
no una relación UML de inclusión, extensión o generalización. El recorrido de pantallas
se desarrolla en el [catálogo de navegación](../../architecture/views/scenarios/navigation-and-screens.md).

La notación `usecase-beta` requiere Mermaid 12. Cada figura es un corte del mismo
sistema. Actores, precondiciones y permisos se comprueban en la ficha de cada objetivo.
Los óvalos conservan el ID y abrevian el verbo cuando el recurso ya está identificado
por el límite del sistema; las fichas mantienen el nombre completo. Un alta auxiliar
de otro recurso conserva su nombre para distinguirla de las operaciones del corte.

| Actor | Participación representada |
| --- | --- |
| Usuario registrado | Inicio y cierre de sesión. |
| Usuario de área operativa | Consulta de inventario y consulta/alta/edición de salidas dentro de su alcance. |
| Personal de almacén | Operaciones admitidas de almacén y documentos, incluidos surtido/devolución según permiso. |
| Administrador del sistema | Participación heredada de Almacén y objetivos administrativos específicos. |

La jerarquía común está en [Acceso](01-access.md#autenticación): el actor operativo
especializa Usuario registrado y conserva asociaciones propias, sin heredar gestión de
Almacén. El alcance por área se describe en la
[selección de destino](../../architecture/views/processes/07-issues/04-department-scope.md).

## Áreas funcionales

- [Acceso y sesión](01-access.md).
- [Personas y usuarios](02-identity.md).
- [Inventario](03-inventory.md).
- [Movimientos](04-movements.md).
- [Clientes y proveedores](05-directory.md).
- [Catálogos administrables](06-catalogs.md).
- [Compras](07-purchases.md).
- [Salidas](08-issues.md).
- [Altas desde selectores](09-contextual-creation.md): relaciones auxiliares de las capturas anteriores.

Las páginas independientes de Clientes y Proveedores corresponden a Sistemas.
Almacén conserva el alta contextual desde los selectores; esa participación no
hereda la consulta ni el mantenimiento independiente del Directorio.

## Asociaciones y relaciones entre casos

Consultar, crear, editar, ajustar, retirar, corregir, cancelar, surtir, devolver y
generar un reporte son objetivos distintos. La vista los organiza alrededor de la
consulta: el actor se asocia normalmente con ella y las operaciones se conectan a
esa consulta mediante líneas simples sin etiqueta. No se repite la asociación del
actor del recurso con cada operación. Las fichas identifican todos sus actores,
precondiciones y efectos; el enlace de acceso no concede permisos ni hace obligatoria
la operación dentro de la consulta.

Un mismo caso admite varios actores. Sus asociaciones pueden coexistir sin que los
actores tengan generalización entre sí. En esta vista, los actores que comparten
operaciones se conectan sólo a la consulta; las altas y ediciones compartidas mantienen
sus enlaces desde ella. Una asociación adicional con una operación se reserva para
una participación exclusiva, como los ajustes del Administrador del sistema.

En Salidas, Almacén y las áreas operativas pueden iniciar las mismas altas y ediciones.
Auxiliar y Coordinador de Almacén, y Administrador del sistema, acceden a todas las
áreas; el acceso operativo se limita a sus áreas autorizadas. Surtir, devolver y
generar reportes requieren los permisos de Almacén o Sistemas. La ficha conserva los
actores alternativos de cada ejecución y sus límites; no exige que intervengan juntos
ni concede operaciones por compartir la consulta.

| Relación | Cuándo aplica y cómo se lee |
| --- | --- |
| Actor — caso | El actor participa en el objetivo. Un permiso exclusivo se representa mediante su actor y las condiciones de la ficha; no cambia el tipo de relación entre casos. |
| Consulta — operación | Enlace simple de acceso desde el listado, sin flecha ni etiqueta. Es una convención de esta vista resumida; no representa una asociación UML entre casos, una llamada ni una transferencia de permisos. |
| Generalización de actores | El actor especializado hereda las asociaciones del general; el triángulo hueco apunta al general. Una asociación exclusiva se mantiene en el especializado. Esta herencia no crea relaciones entre casos. |
| Alta auxiliar `«extend»` Captura | El alta inserta comportamiento en un punto de selección de la captura cuando falta un registro y el actor autorizado elige crearlo. La captura también puede completarse con un registro existente. Al terminar el alta devuelve la selección y reanuda el punto documentado. |
| Base `«include»` Caso requerido | La flecha apunta al comportamiento que la base debe incorporar al alcanzar el punto de inclusión. Requiere un objetivo identificable y una necesidad descrita en el flujo; no significa «se abrió antes» ni representa un permiso o una lectura interna. |

Por ejemplo, Personal de almacén y Usuario de área operativa se asocian con
`CU-ALM-01` Consultar materiales. El Administrador del sistema hereda la participación
de Almacén y conserva una asociación propia con `CU-ALM-05` Ajustar existencia de
material. Consultar y ajustar no tienen una relación `include` ni `extend` entre sí.
El ajuste mantiene también su enlace simple con la consulta porque se abre desde
ese listado. La generalización del administrador no elimina ese enlace: representa
la herencia de participación entre actores, mientras el enlace identifica el acceso
a una operación del recurso.
El acceso operativo no hereda funciones de Almacén, ya que ambos actores pertenecen
a ramas diferentes de Usuario registrado.

Las [altas desde selectores](09-contextual-creation.md) sí documentan extensiones:
por ejemplo, `CU-CAT-02` Crear proveedor se inserta en la selección de proveedor de
`CU-ENT-02` Crear compra de material. La condición, el paso de inserción y el retorno
están en ambas fichas. Ejecutar Crear proveedor desde el listado de Sistemas es una
participación independiente y no una extensión de Consultar proveedores. Ningún caso
del modelo vigente necesita una inclusión para expresar estas relaciones.

No se utiliza `exclude`: UML no define esa relación de casos de uso. Una acción no
permitida se expresa con actor, permiso, condición y rechazo. Tampoco se agrega un
`include` hacia Iniciar sesión: disponer de sesión es una precondición del objetivo
protegido, no una obligación de volver a ingresar credenciales en cada operación.
