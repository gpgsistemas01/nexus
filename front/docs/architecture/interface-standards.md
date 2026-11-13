# Estándar de interfaz y accesibilidad

## Alcance y fuentes

Estas reglas regulan formularios, controles, estilos, navegación y recuperación
visual. Sus fuentes operativas son `app/plugins/vuetify.ts`,
`shared/ui/controlDefaults.ts`, `shared/ui/warehouse.css` y los componentes
compartidos de `front/src`. La [selección de controles](views/logical/components/08-shared-ui.md)
explica la solución y sus dependencias.

## Formularios

| Situación | Comportamiento requerido |
| --- | --- |
| Apertura o precarga | Sin errores prematuros: `validateOnMount: false`; la asignación programática no marca edición. |
| Edición de un campo | `useFormInteraction` registra la interacción; al salir valida si se editó o se intentó enviar. Enfocar un campo intacto no publica errores. |
| Envío | Validar el conjunto y presentar el mensaje junto al campo correspondiente. |
| Pendiente o rechazo | Indicar el estado y conservar la captura recuperable; confirmar sólo después de la respuesta contractual. |
| Alta desde un selector | Conservar el formulario principal y seleccionar el registro confirmado al cerrar el auxiliar. |
| Compras y Salidas | Las altas auxiliares se ofrecen dentro de los selectores. El cuerpo del formulario utiliza **Agregar** para preparar detalles; el pie conserva **Regresar** y el envío. Las acciones de cada detalle permanecen en su tabla. |

En Compras, el orden de captura es comprobante y factura, proveedor y receptor,
fecha de recepción, observaciones y detalles. En Salidas: cliente y asesor, área y
solicitante, proyecto y fecha, observaciones y detalles. Los encabezados usan
medias filas en escritorio y filas completas en móvil; observaciones y selector de
artículo ocupan todo el ancho. Debajo del artículo aparecen cantidad, costo por
presentación cuando corresponde, presentación de consulta y **Agregar**.

Los límites de factura (50), proyecto (10) y observaciones (500) proceden de
`FORM_FIELD_LIMITS`; los controles aplican `maxlength` sin sustituir la validación.
En la columna **Acciones**, Compras muestra **Editar compra** y **Ver compra**;
Salidas muestra **Editar salida**, **Surtir detalle** o **Devolver material surtido**,
y **Consultar salida**, según permisos y estado. Los detalles de compra conservan
**Corregir detalle** antes de **Cancelar detalle**.

Las tablas de detalles agrupan **Base/Altura** en **Medidas** y **Cantidad/Unidad**
en **Conversión**. En Salidas, **Cantidad surtida** aparece al surtir o devolver;
**Cantidad devuelta**, sólo al devolver. Costos, cantidad a surtir, proyecto, diferencia y casilla de
surtido corresponden al modo **Surtir**. Las columnas de acciones se omiten en
consulta sin operaciones disponibles. El estado cancelado de un detalle de compra
se indica junto al artículo. El listado de Salidas muestra **Área** para Almacén y
Sistemas, a partir de `organization` en la sesión; ocultarla no cambia los índices
de ordenación que recibe la API.

VeeValidate se integra en el composable del editor; los componentes visuales reciben
valores y errores mediante contratos tipados. Los [modos de operación](../requirements/requirements-specification/06-operation-modes-and-effects.md)
precisan los campos modificables; los [contratos de formularios](contracts/form-and-event-contracts.md),
los valores y eventos intercambiados.

## Controles y estilos

| Elemento | Regla |
| --- | --- |
| Listados y tablas | Reutilizar `RecordListPanel`, `ServerTable` y `TableFrame`, con estados de carga, vacío, error y paginación. |
| Editores y selectores | Reutilizar `RecordEditorDialog`, `EditorDialog` y `RemoteSelect`; aportar campos, celdas o acciones mediante sus slots y eventos. |
| Tema y defaults | Modificarlos en las fuentes compartidas; evitar bloques globales copiados por módulo. |
| Lectura y contraste | Fondos gris verdoso, texto oscuro y valores de entrada con peso 600. El texto normal mantiene contraste mínimo de 4.5:1 como referencia de WCAG 2.2 AA; los encabezados de tabla conservan texto claro sobre verde oscuro. |
| Campos de consulta o bloqueados | Mantener `readonly` o `disabled`, con fondo diferenciado y datos legibles. El estilo no habilita edición ni envío. |
| CSS local | Usar `scoped` para detalles propios; limitar `:deep` a la adaptación justificada de un control. |
| Selectores CSS | Referirse a clases y contratos estables; evitar texto visible o posición del registro. |
| DOM | Conservar el control de Vue/Vuetify; no superponer otro controlador sobre sus nodos. |
| Avisos | Reutilizar `shared/ui/feedback.ts`; enfocar Cancelar en confirmaciones destructivas. |

### Lectura de las partidas

Las tablas de detalles de Compras y Salidas usan **Inter** como fuente local,
con tamaño mínimo de 14 px en escritorio y tableta. Los nombres y descripciones
se alinean al inicio; cantidades e importes, al final, con cifras tabulares y cero
distinguible. Los encabezados de grupo se centran sobre sus subcolumnas.
Los nombres conservan espacio propio y las cifras se muestran completas, sin
partir decimales ni reducir la letra para encajar todas las columnas.

Cuando faltan píxeles, se desplaza el contenido dentro de `TableFrame`, con sus
controles superiores y la columna del artículo y las acciones fijas. En móvil se
conservan las fichas. Esta distribución se activa con `details`; los listados
mantienen su distribución existente.

## Presentación numérica

`convertedQuantityText` presenta las cantidades en m² con dos decimales en tablas,
resúmenes, diferencias y campos de consulta. Por ejemplo, `1.921383` se muestra como
`1.92`. Las demás unidades conservan hasta seis decimales y los importes su formato
monetario. En campos numéricos de consulta se omiten separadores de miles.

El payload utiliza los valores originales de la captura. Los cálculos y la
persistencia conservan la precisión del contrato de la API; el formato pertenece a
[formatNumbers.ts](../../src/shared/utils/formatNumbers.ts).

## Carga y recuperación

| Situación | Presentación y acción |
| --- | --- |
| Ruta inexistente, acceso denegado, sesión no disponible o fallo de arranque | Las páginas reutilizan `AppStatusPage`: título, causa y acción de recuperación, con foco visible y controles accesibles en móvil. El componente usa HTML y CSS y funciona aunque falle la carga de Vuetify. El reintento de sesión conserva el destino. |
| Abrir o recargar un documento desde una acción de tabla | `DocumentReadDialog` bloquea el fondo mientras se consulta. Permite cancelar y descarta respuestas tardías. Ante un fallo recuperable ofrece **Reintentar consulta**. No cierra por Escape o clic fuera. |
| Buscar opciones | `RemoteSelect` carga al abrirse y muestra la espera/error en el control. El resto del formulario sigue disponible. **Reintentar catálogo** aparece también con una opción previamente seleccionada. |
| Validación de captura | Mensaje junto al campo; conservar los valores para corregirlos. Los errores HTTP 400/422 se muestran sin otro diálogo sólo si todos corresponden a campos del formulario; los demás conservan el aviso general. |
| Sesión o permiso rechazados | Las páginas delegan en el flujo de acceso. Un rechazo del catálogo se muestra en su control sin ofrecer repetirlo. |
| Registro/consulta inexistente o salida que cambió a un estado incompatible | Informar el rechazo y permitir cerrar. No ofrecer repetir el mismo ID o modo. Actualizar el listado antes de elegir otra operación. |
| Conflicto de versión al guardar | Mostrar el error en el modal, conservar la captura y bloquear otro envío con la versión anterior. Al volver al formulario se ofrece actualizar. |
| Envío o descarga fallidos desde un formulario | `FormErrorDialog` muestra el error en el centro y bloquea el fondo, Escape y clic fuera. **Volver al formulario** cierra sólo el aviso y conserva la captura; no repite la operación. La confirmación destructiva conserva su propio modal. |

La [política HTTP](contracts/client-contracts.md#sesión-y-errores) define la recuperación
automática. `readFailure.ts` clasifica los rechazos que no admiten reintento manual.

## Teclado y distribución

Los controles conservan nombre accesible, foco y acción de teclado. Un diálogo
mantiene cancelación y acciones visibles en pantallas estrechas; cerrar un auxiliar
devuelve el control al origen. Las tablas anchas desplazan su marco sin desbordar
el documento.

El menú agrupa capacidades en acordeones. En escritorio inicia compacto con iconos,
se expande al pulsar y se compacta al navegar, pulsar Escape o hacer clic fuera.
En móvil utiliza un drawer temporal. Compartir el layout conserva esos estados.

## Verificación

Revisar foco, teclado, errores iniciales, ancho móvil y recuperación en el recorrido
afectado. jsdom comprueba estado y contratos; la distribución y la interacción real
se verifican en navegador, conforme al [plan de pruebas](../testing/01-test-plan.md).
