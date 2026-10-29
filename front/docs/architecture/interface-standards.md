# Estándar de interfaz y accesibilidad

## Alcance y fuentes

Estas reglas regulan formularios, controles, estilos, navegación y recuperación
visual. Sus fuentes operativas son `app/plugins/vuetify.ts`,
`shared/ui/controlDefaults.ts`, `shared/ui/warehouse.css` y los componentes
compartidos de `front/src`. La [selección de controles](views/logical/ui-and-http.md)
explica la solución y sus dependencias.

## Formularios

| Situación | Comportamiento requerido |
| --- | --- |
| Apertura o precarga | Sin errores prematuros: `validateOnMount: false`; la asignación programática no marca edición. |
| Edición de un campo | `useFormInteraction` registra la interacción; al salir valida si se editó o se intentó enviar. Enfocar un campo intacto no publica errores. |
| Envío | Validar el conjunto y presentar el mensaje junto al campo correspondiente. |
| Pendiente o rechazo | Indicar el estado y conservar la captura recuperable; confirmar sólo después de la respuesta contractual. |
| Alta desde un selector | Conservar el formulario principal y seleccionar el registro confirmado al cerrar el auxiliar. |

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
| CSS local | Usar `scoped` para detalles propios; limitar `:deep` a la adaptación justificada de un control. |
| Selectores CSS | Referirse a clases y contratos estables; evitar texto visible o posición del registro. |
| DOM | Conservar el control de Vue/Vuetify; no superponer otro controlador sobre sus nodos. |
| Avisos | Reutilizar `shared/ui/feedback.ts`; enfocar Cancelar en confirmaciones destructivas. |

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
