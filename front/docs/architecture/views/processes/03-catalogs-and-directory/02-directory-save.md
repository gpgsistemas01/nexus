# Directorio: alta, edición y retorno de opción

## Escenario y fuente

CU-CAT-02/03/06/07. Fuentes: `useDirectoryEditor`, `directoryPayload`,
`directoryService.save` y `DirectoryCreationPage`. Clientes/Proveedores conservan
campos y permisos propios; la confirmación puede cerrar una página o devolver una opción.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-022`. Mensajes numerados y ramas de modo/respuesta.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Directory<br/>Form.vue
    participant Page@{ "type": "boundary" } as Directory<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useDirectory<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload@{ "type": "control" } as directory.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    end
    U->>Form: Guardar cliente o proveedor
    Form->>Page: submit
    Page->>Editor: submit()
    Editor->>Editor: validar reglas de clientes o proveedores
    alt captura inválida o conflicto
        Editor-->>Page: errores sin petición
    else captura válida
        Editor->>Save: execute(operation)
        Save->>Editor: operation(signal)
        Editor->>Payload: directoryPayload(resource, target, values)
        Payload-->>Editor: payload del modo
        Editor->>Service: save(resource, target, payload, signal)
        Note over Service: HTTP, código y normalización en SEQ-037
        Service-->>Editor: DirectoryEntry
        Editor->>Editor: conservar savedEntry
        Editor-->>Save: operación resuelta sin fila de retorno
        Save->>Editor: onSaved() si vigente
        Editor->>Page: options.onSaved(savedEntry)
        Page->>Page: emitir saved(savedEntry) hacia su contenedor
    end
```

La figura parte de una captura válida. `directoryPayload` se construye en el callback
del editor; éste conserva la entrada devuelta en `savedEntry`. La operación termina
sin devolver esa fila a `useRecordSave`; su callback de éxito notifica a la página con
la entrada conservada. Un error propaga al guardado compartido y mantiene captura/
conflicto. Validar, abrir o cancelar no dispara una escritura.

La selección del origen sólo acepta el registro confirmado y activo conforme al
consumidor. Abrir/cancelar el auxiliar no guarda el formulario principal. Las
[secuencias de alta contextual](../../development/design-and-construction-patterns/09-contextual-creation.md)
identifican cada Workspace y callback. Evidencia: `directoryTest.ts`, `records.spec.ts`
y `selectCreation.spec.ts`.

## Transporte y retorno del registro

**Identificador:** `DIA-VUE-SEQ-037`. **Pregunta:** ¿Cómo se obtiene una opción de cliente o proveedor confirmada?

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: request con POST o PUT, payload y signal
    HTTP->>API: endpoint de clientes o proveedores y /id en edición
    API-->>HTTP: respuesta de operación
    alt petición rechazada
        HTTP-->>Service: ApiError
    else cuerpo recibido
        HTTP-->>Service: code y client o supplier
        Service->>Contract: confirmMutation(result, código del recurso y modo)
        Contract-->>Service: confirmación o ApiError
        Service->>Service: normalizeEntry(resource, registro)
        Service->>Contract: readRecord, readState y readText
        Contract-->>Service: campos comprobados o ApiError
        Note over Service: Sólo save resuelto entrega DirectoryEntry al editor de SEQ-022
    end
```

## Fuentes de los participantes

[DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue),
[DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue),
[useDirectoryEditor.ts](../../../../../src/modules/directory/composables/useDirectoryEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[directory.ts](../../../../../src/modules/directory/directory.ts),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
