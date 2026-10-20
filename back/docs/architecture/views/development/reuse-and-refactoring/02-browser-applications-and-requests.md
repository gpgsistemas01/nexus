# 2. Navegador: aplicaciones CRUD y requests configurables

Las factories son funciones que devuelven operaciones configuradas. `application`
adapta argumentos y respuestas; `services` construye HTTP. Se distinguen porque
cambiar una clave de respuesta y cambiar una URL afectan contratos diferentes.
Las flechas apuntan del consumidor a la dependencia.

## Aplicaciones y contratos configurables

**Identificador:** `DIA-COD-REU-001`. **Pregunta:** ¿qué configuradores reutilizan las
factories y qué variación permanece local? **Alcance:** módulos del navegador bajo
`src/public/js/application`; se muestran consumidores representativos verificables.

```mermaid
flowchart TB
    catalogs["materials.js · consumables.js · wastes.js<br/>requests y mutaciones del recurso"] --> crud["createCrudApplication<br/>getAll · register · edit<br/>additionalMutations"]
    issues["materialGoodsIssues.js<br/>consumableGoodsIssues.js · wasteIssues.js<br/>requests + claves de devolución"] --> issue["createIssueApplication<br/>editHeader · editDetails · returnDetail"]
    issue --> crud
    reports["sales/report.js · warehouse/report.js<br/>request del reporte propio"] --> report["createReportApplication<br/>request → response.data"]
```

`createCrudApplication` crea closures y congela el objeto de operaciones. El configurador
exporta referencias con vocabulario del recurso. `createIssueApplication` añade nombres
de mutaciones y claves de respuesta mediante configuración del CRUD. La factory de
reportes devuelve `response.data`; la descarga y la interacción visual continúan en los
consumidores, no dentro de esa factory.

La [secuencia de construcción](../design-and-construction-patterns/03-patterns-in-code.md#factories-y-composición-sobre-herencia)
explica cuándo se crea la configuración y cuándo se usa. Las diferencias de cantidades,
autorización y transacción se conservan en cada contrato y servicio propietario.


## Factories de requests por contexto

**Identificador:** `DIA-COD-REU-003`. **Pregunta:** ¿qué transporte comparten compras
y salidas de materiales/consumibles y qué fija cada adaptador?
**Fuente:** `src/public/js/services/warehouse/goodsReceipts` y `goodsIssues`.
Las flechas apuntan del consumidor a la dependencia; el diagrama muestra construcción,
no el orden de una petición completa.

```mermaid
flowchart TB
    receiptAdapters["materialGoodsReceiptService<br/>consumableGoodsReceiptService<br/>apiRoute + reportRoute"] --> receipts["createGoodsReceiptRequests<br/>consulta · alta · encabezado<br/>corrección · cancelación · reporte"]
    issueAdapters["materialGoodsIssueService<br/>consumableGoodsIssueService<br/>apiRoute + reportRoute"] --> issues["createGoodsIssueRequests<br/>consulta · alta · edición<br/>encabezado · detalles · devolución · reporte"]
    receipts --> http["axiosInstanceApi.apiRequest<br/>método · URL · params · data<br/>transporte y renovación compartidos"]
    issues --> http
```

Los servicios del navegador con nombre de dominio fijan las rutas y exportan las
referencias producidas por la factory. `apiRequest` conserva el transporte común;
`createCrudApplication` y `createIssueApplication` consumen después esos requests para
adaptar operaciones y respuestas. Son dos fronteras reutilizadas distintas:
**construcción del request** y **construcción de la aplicación**.

La factory de compras mantiene corrección y cancelación; la de salidas mantiene
encabezado, detalles y devolución. No se fusionan por semejanza de nombres, porque sus
URLs, argumentos y efectos difieren. Los reportes configuran `responseType: 'blob'`.
La factory de salidas de esta figura tiene configuradores de materiales y consumibles;
no se atribuye a merma un consumo que sus imports no demuestran.


## Cómo se ejecuta el contrato CRUD

`createCrudApplication` captura `requests`, `dataKey`, `dataKeys` y las mutaciones
adicionales. Devuelve un objeto congelado; el módulo del recurso exporta sus funciones
con nombres como `registerMaterial`. El objeto congelado fija las referencias de las
operaciones; no congela datos de formulario ni crea reglas de negocio.

| Operación | Argumentos y resultado comprobados en el código |
| --- | --- |
| `getAll(params = {})` | `createApplicationList` llama `request({ params })` y devuelve la respuesta sin transformarla. DataTable utiliza después `response.data`. |
| register/edit/adicionales | `createApplicationMutation` transforma `formData` a `data`, conserva `id`/`detailId` si existen y propaga opciones adicionales. Espera el request y llama `createSuccessResponseFromRequest`. |
| Respuesta de mutación | Siempre produce `message` desde `data.code`; sólo añade `data` cuando se configuró una clave. No devuelve automáticamente toda la entidad recibida. |
| `createIssueApplication` | Delega en CRUD y añade `editHeader`, `editDetails`, `returnDetail`; `dataKeys.issue` fija la clave general y `issueReturn` la de devolución. |
| `createReportApplication` | Propaga argumentos al request y devuelve `response.data`. Construcción de nombre, Blob/descarga y botones pertenecen al consumidor. |

Por ejemplo, `materials.js` configura `dataKeys.register='material'`: el alta devuelve
`{ message, data: response.data.material }`; sus mutaciones sin clave devuelven sólo
`{ message }`. Para alta desde compra, el configurador elimina `maxUnitCost`/`newStock`
y envía `creationContext='goodsReceipt'` antes del request. Esa adaptación permanece
local al recurso.

En salidas, `materialGoodsIssues.js` y `consumableGoodsIssues.js` configuran la clave de
devolución, mientras `wasteIssues.js` configura tanto `issue='wasteIssue'` como
`issueReturn='wasteIssueReturn'`. La coincidencia de la factory no implica respuestas
idénticas. Los errores del request se propagan: el manejo visual ocurre en el formulario.

## Configuración de URLs y reporte

`services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js` captura
`apiRoute='/api/warehouse/goods-receipts/materials'` y una URL de reporte Excel.
Consumibles utiliza sus propias rutas y los mismos builders. Los identificadores se
insertan en las URLs por operación (`/:id`, detalles, correcciones, cancelación o
devolución); los argumentos se convierten en `params`/`data`. La factory de requests
conserva la respuesta de `apiRequest`; no aplica `dataKey` ni decide permisos.

Los requests de reporte usan `responseType: 'blob'`. Las factories de compras y salidas
son distintas por sus firmas y URLs. `wasteIssueService.js` define sus requests propios,
aunque `wasteIssues.js` sí reutiliza `createIssueApplication` en la frontera de application.

## Contexto compuesto por la página

`goodsIssueContext.js` y `goodsReceiptContext.js` son puntos de composición: leen la metadata renderizada y llaman a la factory de application una vez. Las factories seleccionan funciones ya existentes de material o consumible y fijan la lectura y exportación correspondientes. Los formularios usan esas referencias; las tablas reciben el objeto por configuración y Select2 recibe `resource` por argumento. No hay imports desde services/application hacia pages ni selección global condicionada por el DOM al importar un servicio. Los reportes de otros módulos conservan su configuración independiente.

| Antes | Responsabilidad conservada |
| --- | --- |
| Servicios genéricos reexportaban funciones elegidas mediante el contexto de la página. | Los servicios de material/consumible siguen exportando las mismas peticiones HTTP; application selecciona sus referencias una vez. |
| El reporte genérico volvía a delegar en el reporte específico. | El contexto recibe `exportReport` configurado con el request específico; Blob, descarga y mensajes siguen en UI. |
| El servicio obtenía implícitamente el recurso desde pages. | La lectura por ID recibe `resource`; las escrituras siguen usando las rutas específicas. |

Se retiran aliases y reexports duplicados, no operaciones de alta, consulta, edición,
devolución, corrección, cancelación o reporte. Las pruebas de selección del recurso
se ubican en application porque ésa es ahora la frontera que toma la decisión.
