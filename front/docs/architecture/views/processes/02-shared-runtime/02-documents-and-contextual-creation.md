# 3. Documentos y creación contextual

## Compra

`PurchaseWorkspace` compone página y auxiliares. `usePurchaseEditor` coordina captura
y lectura; encabezado, selección de línea, borrador, vista previa y mappers conservan
responsabilidades propias. Alta permite partidas; edición conserva proveedor y sólo
agrega partidas nuevas; consulta no guarda. Corrección/cancelación de un detalle
usan sus operaciones y confirmaciones, sin reescribir el documento entero.

Las observaciones del encabezado permanecen editables conforme al modo; las de
corrección/movimiento son registros distintos. Totales de la captura son vista previa.
La respuesta confirmada y una consulta posterior muestran el estado del servidor.

## Salida

`IssueWorkspace` compone alta de cliente y página. Encabezado, líneas, selección de
surtido y devolución tienen contratos distintos. Antes de surtir se editan las
partidas admitidas; después se protegen los detalles persistidos/surtidos. Surtir
requiere selección y cantidad de proyecto; devolver exige positivo hasta el saldo
entregado leído. La API comprueba de nuevo estado, pertenencia, permisos y saldo.

## Alta auxiliar desde selector

`RemoteSelect` emite intención y texto. La Page/composable construye `LookupCreation`
y el Workspace abre el editor del recurso. El resultado confirmado pasa por el callback
que acepta la opción; cancelar o fallar no cambia la selección ni guarda el principal.

Los diagramas generales y específicos se conservan en [Creación contextual](../../development/design-and-construction-patterns/09-contextual-creation.md):
proveedor desde inventario, proveedor y artículo desde compra, y cliente desde salida.
Cada consumidor tiene sus participantes y retorno. `creationContext=goodsReceipt`
impide que el alta de artículo contabilice stock antes de registrar la compra.

## Recuperación de merma duplicada

Un duplicado definitivo identificado y con permiso puede ofrecer Abrir Agregar stock.
Cancelar conserva alta; confirmar traslada identidad, cantidad y observaciones al
editor de entrada. Cantidad cero se deja vacía para una entrada positiva. Abrir el
editor no modifica stock: exige revisar y Guardar con una nueva identidad de operación.
La ficha `CU-ALM-10` y los casos `CP-VUE-WH-011-01/02` detallan datos y alternativas.

## Evidencia

`purchaseTest.ts`, `issueTest.ts`, `warehouse.spec.ts`, `purchases.spec.ts`,
`issues.spec.ts` y `selectCreation.spec.ts` comprueban contratos e interacción.
La evidencia de stock/transacciones requiere un recorrido con servidor y persistencia
reales; no se atribuye a las respuestas simuladas de estas suites.
