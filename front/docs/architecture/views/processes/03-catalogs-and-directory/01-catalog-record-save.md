# Alta y edición de catálogos

## Escenario y contratos

**Casos relacionados:** CU-CAT-10/11/13/14/16/17/19/20/22/23/25/26; soporte de Directorio.

**Fuente técnica:** useCatalogEditor.ts, catalog.ts, useRecordSave.ts y catalogService.ts.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-004`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    participant Editor@{ "type": "control" } as useCatalogEditor
    participant Save@{ "type": "control" } as useRecordSave
    participant Service@{ "type": "boundary" } as catalogService
    participant API@{ "type": "boundary" } as API
    participant Page@{ "type": "boundary" } as CatalogEditorPage
    Editor->>Save: execute(operation)
    Save->>Editor: operation(signal)
    Editor->>Editor: buildCatalogPayload
    Editor->>Service: save(payload, signal)
    Service->>API: POST o PUT
    API-->>Service: código y registro
    Service->>Service: confirmar y normalizar
    Service-->>Editor: CatalogEntry
    Editor-->>Save: resultado
    Save->>Page: onSaved si vigente
```

La secuencia desarrolla el camino confirmado después de validar la captura. El callback
pertenece al editor; `useRecordSave` controla su ejecución. `catalogService` comprueba
el código y normaliza `CatalogEntry`; el callback de página no necesita consumir la fila.

| Condición | Resultado |
| --- | --- |
| Precarga | Esquema por catálogo y valores iniciales sin publicar errores. |
| Captura inválida | `handleSubmit` presenta campos y no ejecuta `execute`. |
| Rechazo o conflicto | El error vuelve desde el servicio al callback y al guardado compartido; conserva captura y bloquea el reenvío incompatible cuando corresponde. |
| Confirmación tardía | Si la señal está abortada, no llama al contenedor. |

## Reglas y recuperación

Los seis catálogos comparten coordinación y conservan campos/límites de su definición. El símbolo sólo aplica a Unidades. Directorio usa su propio editor/servicio y payload, con el mismo ciclo de guardado, sin convertir los dominios en un CRUD universal.

## Evidencia

catalogEditorTest.ts, catalogs.spec.ts y directoryTest.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
