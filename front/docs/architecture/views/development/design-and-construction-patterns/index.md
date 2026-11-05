# Patrones y mecanismos del frontend

Cada ficha presenta el modelo general y su aplicación con archivos de Nexus.

| Mecanismo | Modelo general | Aplicación |
| --- | --- | --- |
| Contenedor/presentación | [Props y eventos](02-container-and-presentation.md#modelo-general-de-contenedor-y-presentación). | [Catálogos](02-container-and-presentation.md#aplicación-en-la-página-de-catálogos) e Inventario. |
| Composables y callbacks | [Operación configurada por el consumidor](03-composables-and-callbacks.md#modelo-general-de-composición-por-callback). | [Listado](03-composables-and-callbacks.md#dependencias-y-composición-de-un-listado), [merma duplicada](03-composables-and-callbacks.md#coordinación-de-la-alternativa-de-merma-duplicada) y [selección de Inventario](03-composables-and-callbacks.md#selección-dependiente-de-inventario). |
| Adaptadores | [Lectura de datos](04-http-and-data-adapters.md#modelo-general-de-adaptación-de-una-lectura). | [Consulta de Compra](04-http-and-data-adapters.md#aplicación-al-consultar-una-compra). |
| Slots | [Regiones](05-slots-and-visual-composition.md#modelo-general-de-composición-por-slots) y [evaluación](05-slots-and-visual-composition.md#evaluación-general-de-un-slot-con-alcance). | [Celdas](05-slots-and-visual-composition.md#aplicación-a-las-celdas-de-catálogos) y [sus eventos](05-slots-and-visual-composition.md#evaluación-de-una-celda-de-catálogos). |
| Provisión de sesión | [Instancia compartida](06-session-provision.md#modelo-general-de-provisión-de-estado-de-aplicación). | [Arranque y consumidores](06-session-provision.md#aplicación-en-el-arranque-de-vue). |
| Fábricas de esquemas | [Construcción](07-schema-factories.md#modelo-general-de-construcción-de-un-esquema) y [ejecución](07-schema-factories.md#ejecución-general-del-producto-de-la-fábrica). | [Reglas de Salidas](07-schema-factories.md#aplicación-al-esquema-del-editor-de-salidas) y [captura vigente](07-schema-factories.md#ejecución-del-esquema-de-salidas). |
| Composición de documentos | Combina callbacks, esquemas y adaptadores. | [Escritura](08-document-responsibilities.md#composición-del-editor-y-adaptadores) y [confirmación](08-document-responsibilities.md#secuencia-de-guardado-confirmado) de Compras/Salidas. |
| Altas contextuales | [Apertura y retorno](09-contextual-creation.md#modelo-general). | [Proveedor en Inventario](09-contextual-creation.md#caso-1-proveedor-desde-inventario), [proveedor/artículo en Compras](09-contextual-creation.md#caso-2-proveedor-o-artículo-desde-compras) y [cliente en Salidas](09-contextual-creation.md#caso-3-cliente-desde-salidas). |

La [aplicación de SOLID](01-applicability-and-principles.md) resume los principios.
Los [contratos](../../../contracts/index.md) precisan datos y resultados; la
[guía visual](../../diagram-reading.md) explica la notación.

Referencias de Vue: [props](https://vuejs.org/guide/components/props.html),
[eventos](https://vuejs.org/guide/components/events.html),
[composables](https://vuejs.org/guide/reusability/composables.html),
[slots](https://vuejs.org/guide/components/slots.html) e
[inyección](https://vuejs.org/guide/components/provide-inject.html).
