# 8. Formularios, estilos y accesibilidad

## Validación e interacción

VeeValidate reside en el composable del editor. Se conservan esquemas públicos y
`validateOnMount: false`. `useFormInteraction` registra campos editados, actualiza sin
validación programática y valida al salir sólo después de editar o intentar enviar.
Abrir el modal, cargar catálogos o enfocar un campo intacto no publica errores.
Enviar valida el conjunto y mantiene los mensajes junto al campo que corresponde.

No recortar contraseñas ni aplicar un limpiador que borre símbolos de todo input.
La normalización depende del contrato: nombres pueden recortar espacios extremos,
observaciones conservan texto admitido e identificadores siguen opacos. El servidor
vuelve a validar y autorizar. La [seguridad de entradas](../views/logical/input-security.md)
explica las fronteras y salida segura.

## Marcos visuales

Reutilizar `RecordListPanel`, `ServerTable`, `TableFrame`, `RecordEditorDialog`,
`EditorDialog` y `RemoteSelect` según el contrato existente. Los slots aportan celdas,
campos o acciones específicas sin duplicar el marco de carga, vacío, error y paginación.
No añadir otro controlador de DOM sobre nodos que Vue/Vuetify ya gestionan.

## Tema y CSS

Temas y defaults pertenecen a `app/plugins/vuetify.ts` y `shared/ui/controlDefaults.ts`.
Los estilos de tablas/editor compartidos residen en `shared/ui/warehouse.css`; avisos,
en su hoja propia. Usar CSS scoped para detalles locales; limitar `:deep` a la
adaptación justificada del control. No copiar bloques globales por cada módulo ni
usar selectores que dependan del texto visible o de la posición de un registro.

## Teclado y pantallas

Los controles deben conservar nombre accesible, foco y acción de teclado. Un diálogo
conserva cancelación y acciones visibles en pantalla estrecha; abrir un auxiliar
mantiene la captura y devuelve el control al origen. Los avisos destructivos enfocan
Cancelar. Las tablas anchas desplazan su marco sin desbordar todo el documento.

El menú agrupa capacidades en acordeones; en escritorio parte compacto con iconos y
se expande al pulsar. Navegar, Escape o clic fuera lo compacta. En móvil el drawer es
temporal. No eliminar estos estados al compartir el layout.

## Comprobación

Probar comportamiento de foco, permiso y formulario cuando el cambio los afecte.
El renderizado con jsdom no demuestra por sí solo tamaño, distribución ni interacción
real del control: usar el recorrido de navegador pertinente y revisar la pantalla.
