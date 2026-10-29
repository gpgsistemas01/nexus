# Alta y edición de catálogos

## Escenario y contratos

**Casos relacionados:** CU-CAT-10/11/13/14/16/17/19/20/22/23/25/26; soporte de Directorio.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-004`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Catalog<br/>Form.vue
    participant Page@{ "type": "boundary" } as Catalog<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useCatalog<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload@{ "type": "control" } as catalog.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as catalog<br/>Service.ts
    end
    U->>Form: Guardar catálogo
    Form->>Page: submit
    Page->>Editor: submit()
    Editor->>Editor: validar esquema configurado
    alt inválido o pendiente o conflicto
        Editor-->>Page: errors o bloqueo de envío
        Page-->>Form: conservar captura
    else captura válida
        Editor->>Save: execute(operation)
        Save->>Editor: operation(signal)
        Editor->>Payload: buildCatalogPayload(catalog, target, values)
        Payload-->>Editor: campos explícitos y versión de edición
        Editor->>Service: save(catalog, target, payload, signal)
        Note over Service: HTTP y contrato en SEQ-036
        Service-->>Editor: CatalogEntry o error
        Editor-->>Save: resultado o rechazo del callback
        alt confirmación vigente
            Save->>Page: onSaved(): emitir saved
        else rechazo
            Save-->>Editor: mensaje, campos y conflicto si corresponde
            Editor-->>Page: estado recuperable
        end
    end
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

## Transporte y registro confirmado

**Identificador:** `DIA-VUE-SEQ-036`. **Pregunta:** ¿Qué valida el servicio antes de entregar CatalogEntry?

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as catalog<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: request con POST o PUT, payload y signal
    HTTP->>API: /api/admin/catalogs/catalog y /id en edición
    API-->>HTTP: respuesta de la operación
    alt petición rechazada
        HTTP-->>Service: ApiError
    else respuesta JSON recibida
        HTTP-->>Service: code y data
        Service->>Contract: confirmMutation(result, expected)
        Contract-->>Service: confirmación o ApiError
        Service->>Service: normalizeEntry(data, catalog)
        Note over Service: Comprueba ID, nombre, actividad, versión y símbolo si corresponde
        Note over Service: Devuelve CatalogEntry, un contrato inválido rechaza save
    end
```

## Reglas y recuperación

Los seis catálogos comparten coordinación y conservan campos/límites de su definición. El símbolo sólo aplica a Unidades. Directorio usa su propio editor/servicio y payload, con el mismo ciclo de guardado, sin convertir los dominios en un CRUD universal.

## Evidencia

catalogEditorTest.ts, catalogs.spec.ts y directoryTest.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue),
[CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue),
[useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[catalog.ts](../../../../../src/modules/catalogs/catalog.ts),
[catalogService.ts](../../../../../src/modules/catalogs/services/catalogService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
