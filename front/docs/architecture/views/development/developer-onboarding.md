# Incorporación de un desarrollador al frontend

## Qué hace Nexus

Nexus administra inventario de materiales, consumibles y mermas, sus proveedores,
compras, salidas y movimientos. Una compra registra recepción; una salida comienza
como solicitud y el surtido confirma la entrega. La devolución registra el retorno
de una cantidad entregada. Personas/Usuarios permiten representar responsabilidades
y cuentas; Clientes/Proveedores y los catálogos aportan datos relacionados.

El frontend presenta esos procesos y construye solicitudes. La API comprueba sesión,
permiso, estado, saldos y persistencia. El [glosario de negocio](../../../requirements/business-glossary.md)
define los términos del dominio. Para ejecutar la aplicación se sigue [Inicio local](../../../development/01-getting-started.md),
con terminales y archivos de entorno separados para frontend y API.

## Vocabulario del código Vue

| Término | Significado en este código | Ejemplo |
| --- | --- | --- |
| SPA | Aplicación cuyo Router cambia la página del cliente sin pedir un documento completo por cada navegación interna. | `/catalogos/areas`. |
| SFC | Archivo `.vue` con script, template y, cuando corresponde, estilo del componente. | `CatalogForm.vue`. |
| Page o contenedor | Componente que conecta estado, operaciones y presentación de una pantalla. | `CatalogPage.vue`. |
| Workspace | Contenedor de aplicación que compone capacidades de varios módulos. | `PurchaseWorkspace.vue`. |
| Props | Datos de entrada del componente, modificados por su propietario. | Filas de una tabla o valores de un formulario. |
| Evento | Intención que la presentación comunica a su contenedor. | `submit`, `close`, `create`. |
| Composable | Función `use...` que compone estado reactivo y ciclo de una interacción. | `useCatalogEditor`. |
| Servicio/mapper | Código que consume transporte o traduce entre contrato recibido, dominio y payload. | `catalogService`, `purchaseRequestMapper`. |
| DTO/payload | Forma de los datos de una respuesta o solicitud; no equivale al estado reactivo completo. | Campos permitidos de edición con `expectedVersion`. |
| Slot | Punto de composición visual para aportar contenido dentro de un marco compartido. | Acciones de `RecordListPanel`. |
| provide/inject | Mecanismo Vue para compartir un contrato en el árbol sin pasarlo como prop por todos los niveles. | Sesión de aplicación. |
| Preview | Estimación del navegador que ayuda a capturar; la API vuelve a calcular el resultado persistido. | Totales de compra o largo de merma. |

## Primer recorrido por el código: editar un catálogo

1. Revisar `src/app/router/index.ts` y la definición del catálogo para identificar ruta,
   recurso y permiso. La guarda carga sesión y resuelve acceso antes de presentar la página.
2. Abrir `modules/catalogs/pages/CatalogPage.vue`. La página obtiene `usePageAccess`,
   `useCatalogList` y `useListEditor`, y conecta tabla, búsqueda y editor.
3. Seguir el evento `edit` de `CatalogTable`: la página abre un target con acción y fila.
   `CatalogEditorPage` recibe ese target; la fila contiene la versión de la lectura.
4. Abrir `useCatalogEditor.ts`. El composable precarga valores, registra campos de
   VeeValidate y utiliza `useFormInteraction` para distinguir edición de precarga.
   `CatalogForm` recibe props y emite eventos; no realiza solicitudes HTTP.
5. Seguir `submit`: VeeValidate comprueba captura; `buildCatalogPayload` selecciona campos
   y conserva la versión de apertura; `useRecordSave` administra pendiente/error/conflicto.
6. Revisar `catalogService.save`: el servicio elige método/ruta del recurso y comprueba
   la respuesta esperada. Sólo una confirmación válida permite propagar `onSaved`.
7. Volver a `CatalogPage`: `useListEditor.onSaved` cierra el editor, recarga y presenta
   el aviso. Un 409 mantiene la captura y exige una lectura nueva.
8. Consultar `catalogEditorTest.ts`, `catalogServiceTest.ts` y `catalogs.spec.ts` para
   ver datos y aserciones. La [secuencia aplicada](../processes/05-catalog-record-save.md)
   muestra las decisiones; la [ficha de conflicto](../../../testing/cases/cp-vue-cat-002-01.md)
   concreta los valores del escenario.

## Dónde realizar un cambio

| Cambio | Lugar de partida | Revisión necesaria |
| --- | --- | --- |
| Campo o validación de captura | Contrato, esquema y composable del dominio. | Componente, mapper/payload y casos válidos/inválidos. |
| Disposición/estilo compartido | Componente, tema/defaults y hoja de UI propietaria. | Consumidores y pantalla estrecha; sin añadir HTTP a presentación. |
| Consulta/filtro | Query, composable de listado/filtro y servicio. | Parámetros, página inicial, orden y respuesta tardía. |
| Nueva operación de negocio | Requisito/CU, contrato API y coordinador de dominio. | Permiso, modos, error, confirmación y evidencia del nivel adecuado. |
| Regla común del proyecto | Estándar o configuración que la controla. | Consumidores e impacto; [reglas y recomendaciones](../../../governance/04-conventions-and-criteria.md). |

## Orden de lectura y comprobación

La [estructura](code-structure.md) permite localizar archivos; las [vistas 4+1](../index.md)
permiten elegir la figura adecuada; la [referencia de módulos](frontend-technical-documentation/index.md)
resume contratos y enlaza procesos. El [estándar](../../coding-standards/index.md)
explica convenciones compartidas y el [plan](../../../testing/01-test-plan.md) establece
cómo registrar condición, caso y resultado.

Desde `front/`, `npm run check` comprueba formato, lint, unitarias y build con tipos;
`npm run docs:check` comprueba fuentes documentales. La [guía de sistema](../../../testing/05-system-tests.md)
se utiliza sólo con base aislada y su preparación. Los resultados de una corrida se
asocian a su revisión, no se convierten en una aprobación permanente del documento.
