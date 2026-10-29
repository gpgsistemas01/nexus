# Modelo de casos de uso

## Alcance y notación

Este modelo representa objetivos del negocio y forma parte de los requisitos.
Arquitectura lo utiliza como referencia para la vista de escenarios; las llamadas
entre componentes y los detalles de implementación pertenecen a sus procesos.

Los objetivos están descritos íntegramente en las [94 fichas locales](../use-cases/index.md).
Las figuras agrupan objetivos por recurso dentro del límite Nexus. La
[leyenda visual](../../architecture/views/diagram-reading.md#casos-de-uso) explica actores, óvalos,
asociación, generalización, inclusión y extensión. Las líneas simples vinculan al
actor con sus objetivos. Las acciones opcionales que se ejecutan dentro de una
consulta se representan como extensiones; los cambios de página sin inserción de
comportamiento pertenecen al catálogo de pantallas.

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

## Relaciones entre consulta y operaciones

La consulta obtiene y presenta información y puede finalizar sin ejecutar otra
operación. Su punto **Acciones sobre los resultados** permite elegir un alta,
edición, ajuste, retiro, corrección, cancelación, surtido, devolución o reporte cuando
corresponde. Cada extensión conserva objetivo, permiso, precondiciones y efectos
propios; al completar o cancelar vuelve a la consulta. Las fichas identifican el
paso de inserción, la alternativa y el retorno, incluidos los detalles de un documento
cuando la operación actúa sobre una partida.

| Relación | Cuándo aplica y cómo se lee |
| --- | --- |
| Actor — caso | El actor participa en el objetivo. Un permiso exclusivo se representa mediante su actor y las condiciones de la ficha; no cambia el tipo de relación entre casos. |
| Operación `«extend»` Consulta | Comportamiento opcional: la flecha discontinua apunta desde la operación a la consulta. Requiere elección del actor, permiso y, cuando corresponde, un estado válido. |
| Alta auxiliar `«extend»` Captura | Sólo se inserta si falta un registro relacionado y el actor elige registrarlo. Al terminar devuelve la selección y reanuda la captura. |
| Base `«include»` Caso requerido | La flecha apunta al comportamiento que la base incorpora necesariamente en el punto definido. No significa «se abrió antes» ni representa un permiso. Ninguna de las acciones opcionales de estas consultas requiere esta relación. |
| Generalización de actores | El actor especializado hereda participación del general. No equivale a heredar autorización entre casos relacionados. |

Por ejemplo, `CU-ALM-05` Ajustar existencia de material extiende `CU-ALM-01`
Consultar materiales y conserva su asociación exclusiva con el Administrador del
sistema. El usuario operativo puede consultar sin obtener el ajuste. En Directorio,
el alta desde la consulta independiente corresponde a Sistemas; Almacén ejecuta el
mismo caso de alta desde otra extensión contextual autorizada.

No se utiliza `exclude`: UML no define esa relación de casos de uso. Una acción no
permitida se expresa con actor, permiso, condición y rechazo. Tampoco se agrega un
`include` hacia Iniciar sesión: disponer de sesión es una precondición del objetivo
protegido, no una obligación de volver a ingresar credenciales en cada operación.
