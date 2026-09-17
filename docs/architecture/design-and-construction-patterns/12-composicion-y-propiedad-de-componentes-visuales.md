# 12. Composición y propiedad de componentes visuales

Los partials de `src/views/shared` y las piezas independientes del recurso bajo
`public/js/ui` o `plugins` se componen desde páginas específicas. Un formulario o modal
reutilizado por varias pantallas puede seguir perteneciendo a su recurso si conoce sus
selectores, validaciones y operaciones.

Los partials transversales se agrupan por responsabilidad dentro de `shared`: `controls`
contiene controles de interacción independientes, `forms` reúne campos y composición de
formularios, `layout` contiene estructuras contenedoras y `tables` reúne tablas, filtros
y resúmenes. `issues` se conserva separado porque compone esas primitivas para el contexto
compartido de salidas. `inventory/inventoryCrudModal.ejs` normaliza el contrato del formulario
y delega el marcado al modal de layout para que compras y salidas reutilicen la misma
composición sin trasladar reglas particulares de cada CRUD. En JavaScript,
`ui/inventory/inventoryCrudModalUI.js` comparte la inicialización de modo, identidad, errores
y estado habilitado entre compras, salidas, materiales y mermas; cada CRUD conserva la carga
de campos, encabezados, detalles y selects que sí depende de su contexto. Las vistas
consumidoras referencian siempre la categoría explícita,
y la prueba de estructura impide volver a dejar archivos EJS sueltos en la raíz.

Compras y salidas de material reutilizan `shared/forms/materialSelect.ejs`. Este partial
representa específicamente el campo de material: siempre renderiza `materialInput`,
`materialId` y `material-select` dentro de `col-12`, sin aceptar datos de otro dominio ni
permitir que una página redefina el ancho. El modal conserva el select genérico para
detalles de otros dominios, como merma, y sólo el contexto de material activa el partial.

Este criterio evita dos extremos: duplicar componentes por contexto y crear una
abstracción «compartida» que todavía depende de un recurso concreto. Al editar EJS se
preserva el cierre final de `contentFor` en su lugar; no se elimina y vuelve a agregar
como efecto secundario de una refactorización.

Las alertas SweetAlert siguen el mismo criterio de composición. El adaptador
`plugins/swal/baseSwal.js` concentra apariencia, variantes y botones de todos los
diálogos; los consumidores no llaman `Swal.fire` ni redefinen `customClass`. Cuando un
diálogo necesita contenido interactivo, un componente de `public/js/ui` construye y
expone el nodo HTML reutilizable junto con su ciclo de apertura. Por ejemplo,
`reportExportDialog.js` encapsula las opciones y validación de exportación, mientras
`tableUI.js` conserva únicamente la coordinación de la descarga. Los toast mantienen
su presentación compacta, pero usan el mismo adaptador público `swalComponent.js`.

El encabezado de todos los modales se compone con `shared/layout/header.ejs` y conserva
la clase semántica `modal-title`. Su estilo transversal se declara una sola vez en
`public/css/style.css`: color claro para contrastar con el encabezado secundario, peso
destacado, escala tipográfica adaptable y márgenes normalizados. Los contextos CRUD
sólo actualizan el contenido del título y no deben agregar estilos en línea ni clases
visuales particulares.

El backdrop también es una responsabilidad transversal del modal, no de cada
formulario. Los CRUD abren sus diálogos exclusivamente mediante `openModal`; el helper
común registra el modal en la pila, asocia el backdrop creado por MDB y vuelve a intentar
la asociación al completarse la apertura para admitir tanto creación síncrona como
diferida. Ningún formulario debe crear, buscar, elevar o eliminar backdrops por su cuenta.

### Organización de módulos de una sola responsabilidad

Los archivos con sufijo `Page` son entry points de composición. No registran `useForm`
ni `useIssueForm`: cargan el módulo de formulario propietario y coordinan únicamente
componentes de pantalla como tablas.
Las pantallas sin formulario, como inicio y movimientos, conservan en su entry point los
efectos propios de la pantalla.

Los filtros dependientes de movimientos reutilizan `bindDisabledSelectDependency`, el
mismo bloqueo transversal de Select2 usado por compras y salidas. La configuración del
filtro sólo declara el control de origen, el destino y el mensaje de su contexto; no
debe implementar nuevamente la desactivación, la limpieza ni el aviso visual.

Los módulos que componen varios Select2 dentro de un modal reutilizan
`scopeSelectors` para limitar un mapa de selectores al contenedor. Cada módulo declara
únicamente sus selectores de dominio y el modal que los contiene; no debe repetir la
transformación con `Object.entries` y `Object.fromEntries` ni conservar condicionalmente
un mapa anterior: cada inicialización vuelve a acotarlo al contenedor recibido.

Los módulos con sufijo `Fields` tampoco se replican por convención en cada recurso. Se
crean cuando dos módulos hermanos del mismo contexto comparten grupos de nombres de
campo por modo. Actualmente `materialFields.js` y `wasteFields.js` son contratos entre
sus respectivos formularios y modales para alta, edición y ajuste de stock. Compras,
salidas de material y salidas de merma conservan sus campos en su módulo propietario:
no comparten listas de campos entre formulario y modal, y crear un archivo `Fields` para
cada uno sólo agregaría una frontera sin contrato compartido.

La cantidad de exports o de consumidores no determina por sí sola si un archivo debe
fusionarse. Un módulo con un único método que encapsula la configuración de un CRUD
conserva una frontera útil, pero se ubica en la carpeta de su recurso en lugar de quedar
en la raíz de una infraestructura compartida. Por esta razón, los DataTables se ordenan
primero en `admin`, `sales` y `warehouse`, y después por recurso (`persons`, `clients`,
`goodsReceipts`, etc.). `core` contiene el constructor, la adaptación responsive y los
filtros reutilizables; `shared/issues` e `shared/inventory` contienen únicamente
composición usada por más de un flujo.

Dentro de `core`, la implementación se divide por responsabilidad en `base` (creación,
ciclo de vida, operaciones y botones de acción) y `responsive` (definiciones de
columnas, filas, cuadrícula y grupos de encabezados, y detalle). Cada consumidor importa
el contrato desde su módulo propietario; no se mantienen fachadas `baseDatatable.js` o
`responsive.js` que oculten dependencias y vuelvan a concentrar exports sin aportar una
abstracción adicional.

La composición de columnas de detalles se organiza de la misma manera en
`shared/issues/detailBuilder`: encabezados, columnas, inputs y reglas de visibilidad se
mantienen separados. Es una composición compartida porque entradas, salidas de material
y salidas de merma reutilizan el mismo contrato con distinto `type`, modo y permisos;
los DataTables de cada contexto sólo construyen esa configuración y conservan sus
efectos CRUD propios. Los detalles nuevos de compra reciben un `clientId` efímero para
que varios renglones del mismo material —por ejemplo, con precios o lotes
distintos— permanezcan independientes hasta que el backend les asigne su identidad
documental. Una marca que cambie la identidad operativa corresponde a otro material de
catálogo; no se infiere ni se guarda como atributo del detalle.

La mutación en memoria de detalles no pertenece al plugin de DataTable: entradas,
salidas de material y salidas de merma comparten `upsertDetail`, `removeDetail` y la
comparación de la identidad documental o de inventario desde
`public/js/utils/detailCollectionUtils.js`. Las funciones sólo administran la colección
y devuelven el detalle anterior o eliminado; cada contexto conserva en su formulario o
DataTable los efectos que sí le pertenecen, como totales, limpieza del formulario y
refresco visual. Por ello `addGoodsReceiptMaterial`, `addGoodsIssueMaterial` y `addWaste` no se
fusionan: la compra valida costo, agrega cada renglón como una partida independiente y ajusta totales; la salida
valida proveedor, conserva su costo máximo, convierte cantidades y usa la identidad
material-proveedor; la salida de merma usa `wasteId` y datos de presentación propios.
En edición, si agregar de nuevo el mismo inventario sustituye el detalle persistido,
`upsertIssueDetail` reutiliza `upsertDetail` y conserva su identificador documental
mediante `id`. Las salidas de material y merma aplican el mismo proceso: la fila
mantiene la acción de eliminar después de modificar su cantidad y puede retirarse de la
colección si finalmente ya no se necesita. El mapper de cada formulario continúa
enviando únicamente los campos aceptados por su contrato de actualización.
Volver a agregar la misma merma, o el mismo material con el mismo proveedor, no crea un
duplicado: sustituye los datos editables de la fila y conserva su `id` documental. En
materiales, elegir otro proveedor representa otra relación de inventario y sí agrega un
detalle independiente.
El CRUD de la colección sólo está disponible mientras la salida completa permanece
`Pendiente`. Una salida con surtido parcial o completo abre únicamente la edición del
encabezado, sin controles para agregar o eliminar materiales o mermas; una salida
cancelada se abre en consulta. Por tanto, las reglas de sustitución y eliminación que
siguen corresponden exclusivamente al modo pendiente.
En ese modo, un detalle recién agregado puede eliminarse con su identidad de inventario.
Si la selección coincide con un detalle registrado, el nuevo contenido sustituye la
fila conservando el `id`; eliminarla después retira también el detalle registrado de la
colección que se enviará al servicio.
La columna de acciones conserva prioridad responsiva tanto en alta como en edición
pendiente. El botón `Eliminar detalle` permanece visible y habilitado para la fila nueva,
la fila registrada y la fila registrada que acaba de ser sustituida.
La acción prioriza ese `id` documental conservado, por lo que el ciclo registrado,
editado y finalmente eliminado retira de la colección la misma fila persistida. Al
guardar una salida todavía pendiente, los servicios de material y merma reemplazan sus
detalles con la colección enviada y la ausencia de esa fila concreta su eliminación.
Los detalles agregados por primera vez durante la edición todavía no tienen identidad
documental. La regla compartida muestra también su acción de eliminar usando la
identidad de inventario (`materialId` o `wasteId`), mientras oculta la acción para
detalles cancelados; así pueden retirarse de la lista antes de enviar la actualización.
Los tres reutilizan las utilidades de colección, render y limpieza sin
ocultar esas reglas tras callbacks de contexto. Así `detailDatatableUtils` deja de duplicar una parte del proceso de
issues sin trasladar reglas de compras a una utilidad genérica.

El mismo criterio se aplica al resto del proyecto: un archivo consumido una sola vez
permanece junto a su recurso propietario; sólo se mueve a una carpeta compartida cuando
hay al menos dos consumidores reales y un contrato independiente del contexto. No se
fusionan módulos de capas diferentes para reducir el conteo de archivos, ni se crean
carpetas horizontales para operaciones CRUD aisladas. Al mover un módulo se actualizan
en la misma modificación todos sus imports, exports, pruebas y referencias generadas.

Cuando una operación se invoca una sola vez y no introduce una frontera de capa, se
implementa directamente en su consumidor: la lectura del mensaje flash pertenece al
entry point de inicio y la creación del enlace de descarga pertenece al botón de
exportación. No se publican handlers o utilidades de una sola llamada como componentes
compartidos anticipadamente; se extraen sólo cuando aparece otro consumidor real.

La revisión de ownership se aplica por capa a todo `src`:

| Área | Responsabilidad y decisión de ubicación |
| --- | --- |
| `constants`, `errors`, `messages`, `dtos`, `validators` | Contratos y reglas sin I/O; se subdividen por dominio cuando existe más de un contexto relacionado. Un único archivo de contrato no se mezcla con controller o service. |
| `routes`, `controllers`, `services` | Mantienen dominio y recurso equivalentes entre capas. Los recursos pequeños pueden ser un archivo dentro del dominio; los casos compuestos usan una carpeta del recurso para helpers y reglas privadas. |
| `repository`, `lib`, `middleware`, `utils` | Infraestructura transversal. Un módulo de un solo consumidor sólo permanece aquí si su contrato sigue siendo transversal; de lo contrario pertenece al recurso consumidor. |
| `public/js/services`, `application`, `pages` | Transporte HTTP, caso de uso y composición visual respectivamente. No se fusionan aunque una función tenga un único consumidor porque representan fronteras distintas. `application` y los flujos compuestos se agrupan por dominio y recurso; `report` permanece en el dominio porque sirve a varios recursos. |
| `public/js/plugins` | Adaptadores de bibliotecas externas. `datatable` replica dominio y recurso; `select2` separa adaptadores de dominio de composiciones de varios selects. |
| `public/js/ui` y `views/shared` | Componentes visuales reutilizables sin ownership de página. Si sólo una pantalla conoce sus selectores y proceso, el componente permanece con esa página o recurso. |
| `views/pages` | Entradas EJS por pantalla y partials propietarios. Una reubicación no reescribe ni desplaza el cierre final de `contentFor`. |

Esta revisión prioriza responsabilidad y cohesión, no un mínimo artificial de métodos
por archivo. Separar es necesario cuando un módulo mezcla transporte, coordinación
visual o negocio; fusionar sólo es válido dentro de la misma capa, recurso y ciclo de
cambio.

En `public/js/application`, los casos de sólo lectura que alimentan catálogos se agrupan
por dominio bajo `catalogs`: administración contiene departamentos y roles; almacén,
presentaciones, motivos, unidades de medida y estados de surtimiento. Cada catálogo
conserva su módulo y export de dominio, pero no crea una carpeta de un solo archivo.
Los CRUD con mutaciones o coordinación propia permanecen en la carpeta de su recurso;
movimientos también conserva su ownership porque representa una consulta operativa y
no un catálogo para seleccionar relaciones.

### Estado de surtimiento

`FulfillmentStatus` es una referencia interna de sólo lectura usada por encabezados,
detalles y filtros. No es un CRUD administrable. Sus transiciones funcionales y los
datos afectados se documentan en la
[matriz de operaciones](../../requirements/requirements-operations-matrix.md#modos-precondiciones-y-datos-modificados);
su representación física se consulta en el
[diccionario generado](../../generated/data-dictionary.md). Se evita justificar aquí la
elección de tabla frente a enum porque ese detalle de persistencia no cambia el caso de
uso y repetir relaciones técnicas vuelve redundante esta guía de construcción.

### Contrato de los selects en modales

Los módulos de `plugins/select2/domains` reciben un `baseSelector` ya delimitado cuando
inicializan directamente un dominio. Las funciones de composición `setup*Select`, en
cambio, reciben el selector relativo del control y lo combinan una sola vez con
`modalSelector`. El contenedor del modal se pasa también a cada inicializador para que
Select2 inserte el desplegable dentro del contexto visual correcto.

Los módulos de página conservan esta distinción al reutilizar los selects: reconstruyen
sus selectores delimitados cada vez que se monta el componente, usan el formulario del
CRUD correspondiente para resolver su modo y limpian el control, no el formulario que
lo contiene. Las pruebas unitarias de frontend en
`tests/unit/public/js/plugins/select2` verifican este contrato para materiales y salidas
de merma sin duplicar el recorrido CRUD persistente de las integraciones.

El transporte base de Select2 acepta tanto la respuesta HTTP de los listados CRUD como
un arreglo de opciones ya resuelto por la capa de aplicación. Esta normalización se
mantiene en el adaptador compartido: los catálogos con una selección predeterminada
pueden precargar y reutilizar esas mismas opciones sin envolverlas artificialmente ni
intentar leer `data` de un valor inexistente.

Los inputs de texto y número derivados de un select actualizan su valor mediante
`setMdbWrapperInputValue`. El adaptador compartido sincroniza la clase visual `active`
del control antes de actualizar la instancia MDB: un valor la activa y un valor vacío la
retira. Por ello, al deseleccionar el origen no sólo se vacía el dato dependiente, sino que
su `form-outline` recupera también el estado visual inicial.

Después de agregar un nuevo detalle de material o merma, `clearAddedItemInput` reutiliza
ese mismo adaptador para limpiar cantidad, presentación y costo. La limpieza ocurre como
efecto del clic en agregar, después de actualizar la colección y la tabla, y devuelve
tanto los valores como sus wrappers `form-outline` al estado visual inicial. Cada flujo
conserva sus reglas de validación y composición del detalle, sin duplicar la coordinación
visual compartida.

Los selects que consultan listados CRUD envían `start`, `length` y `search` al mismo
endpoint paginado que utiliza la tabla. Select2 convierte su número de página a ese
contrato y conserva `recordsFiltered` para habilitar la carga incremental mientras
existan opciones. El adaptador base aporta esta transformación por defecto; cada dominio
sólo define el mapeo visual o filtros adicionales. Los conjuntos cerrados y pequeños,
como tipos de movimiento, pueden seguir resolviéndose localmente sin una consulta extra.
La consulta de plantillas de merma aplica `start` después de consolidar por nombre y
ancho, y devuelve el total consolidado en `recordsFiltered`; así, el selector puede
cargar las páginas siguientes sin repetir la primera ni ocultar resultados disponibles.

La paginación base no serializa el resultado completo. Las relaciones que un control
necesita conservar en los atributos de su opción HTML se convierten a JSON dentro del
mapper del dominio, donde se conoce cuáles propiedades son objetos. El consumidor las
normaliza al seleccionarlas. Así se evita convertir datos escalares o imponer el contrato
de inventario a los demás selects. Los mappers de materiales, mermas y plantillas aplican
`JSON.stringify` únicamente a las relaciones que después recupera cada consumidor.

El filtro de estado de surtimiento conserva dos contratos separados: la precarga mínima
resuelve la opción `Pendiente`, mientras que las búsquedas de Select2 consumen la
respuesta paginada completa del catálogo. El adaptador del dominio transforma cada
registro `{ id, name }` en `{ id, text }` sin descartar `recordsFiltered`; así el cálculo
de páginas permanece en el componente base, igual que para proveedores, personas y
otros filtros remotos.

Todos los selects remotos conservan el transporte HTTP compartido y, por tanto, la
renovación de autenticación no se implementa dentro de cada plugin. Las respuestas `401`
concurrentes esperan una única solicitud de refresh y después reintentan su petición
original. La referencia a esa renovación se libera antes de los reintentos, de modo que
una expiración posterior puede iniciar otro ciclo sin quedar asociada a la promesa o a
la cola del ciclo anterior.

El CRUD de merma reutiliza `mapSelectMaterialData`, el mismo adaptador del dominio de
materiales, tanto para los resultados remotos como para restablecer la relación incluida
al editar. El adaptador, los accesores de material/merma y el texto común viven en
`public/js/utils/warehouseInventoryUtils.js`: su alcance incluye Select2, DataTables y
páginas de inventario, por lo que no pertenecen exclusivamente a un plugin de selects.
De este modo el `id` de Select2 continúa siendo el de proveedor-material y el texto
conserva material, medidas y proveedor sin mantener un segundo normalizador ni
introducir otro flujo de consulta. Las decisiones visuales dependientes de la
presentación se resuelven con `getPresentation` sobre el material de la opción, sin
duplicar ese dato como un atributo adicional de Select2. En el alta, `data` es nulo
porque aún no existe una merma persistida; el modal traduce ese estado a una plantilla
vacía antes de entregarla a los lectores, en lugar de ampliar su contrato con un valor
que no representa un material.
