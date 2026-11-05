# Recorrido de los datos tipados

## Alcance y notación

Estos mapas siguen una compra real en Vue/TypeScript. Las cajas identifican datos o
consumidores; las flechas indican transformación/entrega y nombran la operación.
Complementan los diagramas de clases y las secuencias de llamadas.

## Lectura, captura y props

**Identificador:** `DIA-VUE-FLU-001`. **Pregunta:** ¿Cómo se convierte una respuesta
desconocida en datos de formulario? **Fuentes:**
[purchaseService](../../../../../src/modules/purchases/services/purchaseService.ts),
[purchaseResponseMapper](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts),
[purchaseForm](../../../../../src/modules/purchases/purchaseForm.ts) y
[PurchaseEditorPage](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue).

**Lectura visual:** [mapas de datos y transformaciones](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    raw["goodsReceipt: unknown"] -->|normalizar y comprobar ID| document["PurchaseDocument"]
    document -->|createInitialPurchaseValues| values["PurchaseValues<br/>form.values"]
    document -->|document.details| details["details: PurchaseDetail[]<br/>computed en la Page"]
    values -->|values.details nuevos| details
    values -->|prop values| view["PurchaseEditor<br/>presentación"]
    details -->|prop details| view
```

La captura conserva sólo los detalles nuevos en `values.details`; la página los
combina con los persistidos para consulta. Editar la vista no confirma la compra.
Los [tipos de Compra](../../logical/class-and-type-models/07-purchases.md) definen
la estructura; el [contrato HTTP](../../../contracts/client-contracts.md#escrituras-y-confirmación),
la aceptación de los datos recibidos.

## Escritura y confirmación

**Identificador:** `DIA-VUE-FLU-002`. **Pregunta:** ¿Qué transforma la captura antes
de confirmar? **Fuentes:**
[purchaseRequestMapper](../../../../../src/modules/purchases/mappers/purchaseRequestMapper.ts),
`purchaseService.save`, [confirmMutation](../../../../../src/shared/http/recordContract.ts)
y `usePurchaseActions.handleSaved`. Camino confirmado: las validaciones pueden detenerlo
antes de producir el siguiente resultado. Las agrupaciones representan fases de datos;
la conexión entre ellas representa el retorno de la petición HTTP.

```mermaid
flowchart LR
    subgraph sent["Captura y envío"]
        direction TB
        values["PurchaseValues válidos"] -->|mapPurchaseFormToRequest| payload["Payload permitido"]
        payload -->|purchaseService.save| request["POST o PATCH<br/>mediante apiClient"]
    end
    subgraph received["Respuesta y efecto"]
        direction TB
        raw["Respuesta desconocida"] -->|confirmMutation| confirmation["MutationConfirmation"]
        confirmation -->|onSaved si vigente| result["Cerrar, recargar y avisar"]
    end
    sent -->|respuesta de API| received
```

`mapPurchaseFormToRequest` devuelve un `Record<string, unknown>` con los campos
admitidos; no existe una clase `PurchaseRequest`. La API calcula los totales y el
stock que persiste. El [guardado compartido](08-record-save.md) y la
[secuencia de Compra](../06-purchases/02-purchase-save.md) muestran los rechazos.
