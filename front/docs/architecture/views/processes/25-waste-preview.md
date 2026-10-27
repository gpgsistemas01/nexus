# Merma: selección de referencia y vista previa

## Escenario y fuente

CU-ALM-10; fuentes: `previewWaste` en `formModel.ts` y funciones públicas
`prepareWasteRollReference`, `calculateWasteNetWeight` y `calculateWasteRollLength`.
Esta vista describe una actividad de cálculo del cliente. El servidor vuelve a
validar/recalcular los valores que persiste.

## Actividad

**Identificador:** `DIA-VUE-ACT-001`. **Notación:** `flowchart` como aproximación de
actividad; flechas = flujo de cálculo, rombos = decisiones, no UML de actividad nativo.

```mermaid
flowchart TB
    start(["Cambiar captura o plantilla"]) --> presentation{"¿Presentación ROLLO?"}
    presentation -->|No| direct["Conservar base y height capturados; peso preview null"]
    presentation -->|Sí| reference["prepareWasteRollReference de la plantilla"]
    reference --> weights["Calcular neto del sobrante y de referencia con el cono capturado"]
    weights --> valid{"¿Referencia y ambos netos válidos?"}
    valid -->|Sí| length["calculateWasteRollLength con largo original y proporción de netos"]
    valid -->|No| absent["Largo calculado null"]
    length --> orient["Conservar ancho en su campo base/height y poner largo en el otro"]
    absent --> orient
    direct --> preview["Publicar preview reactivo"]
    orient --> preview
    preview --> validate["Esquema valida la captura antes de guardar"]
    validate --> finish(["Fin de vista previa; no se escribe stock"])
```

La vista previa no crea un movimiento. El payload conserva pesos de captura y campos
admitidos; no envía netos/muestras derivados como autoridad. Una operación incierta
recupera su cuerpo guardado y no recalcula otro cuerpo con la misma clave.
`inventoryFormTest.ts` y `warehouse.spec.ts` comprueban representantes; el estado
persistido requiere API/base reales.
