# 4. Factory functions y composición de aplicaciones

### CRUD común del navegador

`createCrudApplication` recibe requests y claves de respuesta, y construye un objeto
inmutable con `getAll`, `register` y `edit`. `createApplicationMutation` concentra la
adaptación de `formData`, `id`, `detailId`, opciones adicionales de contexto y la
respuesta exitosa. La opción `additionalMutations` agrega al mismo objeto operaciones
con ese contrato, usando una clave de respuesta por nombre cuando corresponde.
Personas, usuarios, clientes, proveedores, materiales, mermas, entradas y salidas
configuran esta misma construcción; cada módulo conserva sus nombres de dominio y
adapta únicamente el payload que realmente difiere.

La aplicación no vuelve a enumerar campos que ya fueron seleccionados por el formulario
y normalizados por el DTO del servidor. Materiales envía el objeto recibido sin
reconstruirlo; su único adaptador de registro elimina `maxUnitCost` cuando el contexto
es una entrada de compra, porque ese costo procede del detalle de la entrada. Esta
excepción contextual no sustituye los mapeos existentes ni crea un segundo DTO en el
navegador.

Los listados CRUD devuelven la respuesta del recurso; no agregan métodos `get*Options`
si Select2 ya dispone de `mapOption` para construir `{ id, text }`. Proveedores y
materiales usan directamente `getAllSuppliers` y `getAllMaterials`, tanto en el AJAX del
select como en filtros. Un adaptador de opciones sólo permanece cuando resuelve una
necesidad distinta, por ejemplo precargar «Pendiente» o elegir la primera persona de un
departamento antes de inicializar el filtro.

El objeto construido permanece privado dentro del módulo de contexto. La frontera
pública son exports nombrados en lenguaje de dominio (`registerUser`,
`editGoodsReceiptHeader`, `registerWasteIssueDetailReturn`, etc.), no un export del objeto
genérico. Así los consumidores no dependen de claves como `register`, `edit` o de la
forma interna de la factory; además pueden importar sólo la capacidad que utilizan.
Las referencias exportadas conservan también el formato de entrada de la factory:
`deleteMaterial` recibe `{ id }`, igual que las demás mutaciones, para que datatable,
aplicación y servicio no alternen firmas.

### Especialización de salidas

`createIssueApplication` configura `createCrudApplication` con `editHeader`,
`editDetails` y `returnDetail` como mutaciones adicionales. Salidas de material y de
merma inyectan sus requests y claves; no duplican la coordinación. Entradas de compra
replican el mismo criterio directamente con corrección y cancelación de detalle,
porque sus nombres y reglas de documento son distintos aunque el transporte coincida.

Las mutaciones de detalle especializadas conservan una carpeta explícita dentro de su
recurso. Compras agrupa sus cambios en `goodsReceipts/detailChanges`; las devoluciones
de material y merma se ubican en `goodsIssues/detailReturns` y
`wasteIssues/detailReturns`. En el navegador, cada salida mantiene la coordinación de
su devolución en `pages/warehouse/<recurso>/returns`, mientras el formulario y el modal
permanecen en `ui/issues` y `views/shared/issues` porque ambos contextos reutilizan el
mismo componente. Así la organización no duplica el flujo compartido ni mezcla la
mutación especializada con el modal principal del CRUD.

Se exporta **la función constructora** `createIssueApplication`, no una aplicación de
salida ya creada. Es un punto de composición compartido: cada módulo de salida la llama
con sus propios requests, guarda localmente la instancia resultante y publica sólo sus
operaciones de dominio. Mantener exportable el constructor permite que material y
merma repliquen el mismo proceso sin compartir estado ni exponer el objeto genérico a
la UI.

### Listados de catálogos

`createApplicationList` concentra el contrato de lectura de la capa de aplicación:
recibe un request y produce una operación que siempre lo invoca con `{ params }`. El
CRUD reutiliza esa operación para `getAll`; los catálogos de departamentos, roles,
presentaciones, motivos y unidades de medida configuran la misma función sin repetir
adaptadores equivalentes. Los listados que transforman la respuesta a opciones
conservan su adaptador de dominio.

`createDataTableListController` construye controllers de lectura configurando función
de consulta, columnas y orden predeterminado. Roles, departamentos, presentaciones,
unidades, motivos y estados de cumplimiento reutilizan el mismo parsing de DataTable.
Las salidas de material y merma, que agregan el mismo conjunto de filtros operativos,
reutilizan `utils/issueQueryUtils.getIssueDataTableQuery`; cada controller conserva su
lista segura de columnas, servicio de dominio y alcance de acceso. El parser permanece
en `utils` porque normaliza la query HTTP sin responder ni coordinar el caso de uso.

Son **factory functions**, no los patrones GoF *Factory Method* o *Abstract Factory*:
no existe jerarquía de creadores/productos. Tampoco `createIssueApplication` es
*Template Method*, porque especializa por composición de objetos y no por herencia.

**Regla de construcción:** primero se intenta configurar una factory existente. Sólo se
amplía la abstracción si la nueva operación conserva el mismo contrato en al menos dos
contextos; una diferencia exclusiva permanece en el módulo propietario.

**Regla de exposición:** no se exporta la instancia producida por la factory desde un
módulo de contexto. Se exportan referencias nombradas a sus operaciones, o un adaptador
cuando la firma de dominio difiere. Una función constructora puede exportarse desde un
módulo compartido cuando al menos dos contextos la consumen; su resultado permanece
privado en cada consumidor.
