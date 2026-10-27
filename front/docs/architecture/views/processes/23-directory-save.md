# Directorio: alta, edición y retorno de opción

## Escenario y fuente

CU-CAT-02/03/06/07. Fuentes: `useDirectoryEditor`, `directoryPayload`,
`directoryService.save` y `DirectoryCreationPage`. Clientes/Proveedores conservan
campos y permisos propios; la confirmación puede cerrar una página o devolver una opción.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-022`. Mensajes numerados y ramas de modo/respuesta.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page as DirectoryEditorPage
    participant Editor as useDirectoryEditor
    participant Save as useRecordSave
    participant Service as directoryService
    participant API
    Page->>Editor: resource y target con fila o initialName
    Editor->>Editor: reglas cliente o proveedor y precarga sin errores
    Usuario->>Page: capturar y Guardar
    Page->>Editor: submit y handleSubmit
    alt captura inválida
        Editor-->>Page: errores sin request
    else captura válida
        Editor->>Editor: directoryPayload por recurso y modo
        Editor->>Save: execute con signal
        Save->>Service: save y conservar savedEntry
        Service->>API: POST alta o PUT edición con versión
        alt respuesta confirmada
            API-->>Service: código y registro
            Service-->>Save: entrada normalizada
            Save->>Editor: onSaved si vigente
            Editor-->>Page: onSaved(savedEntry)
            Note over Page: El contenedor cierra/recarga o devuelve opción al Workspace.
        else campo, conflicto o red
            API-->>Service: rechazo
            Service-->>Save: ApiError
            Save-->>Page: conservar captura y error o conflicto
        end
    end
```

La selección del origen sólo acepta el registro confirmado y activo conforme al
consumidor. Abrir/cancelar el auxiliar no guarda el formulario principal. Las
[secuencias de alta contextual](../development/design-and-construction-patterns/09-contextual-creation.md)
identifican cada Workspace y callback. Evidencia: `directoryTest.ts`, `records.spec.ts`
y `selectCreation.spec.ts`.
