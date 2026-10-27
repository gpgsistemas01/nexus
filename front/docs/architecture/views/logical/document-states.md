# Estados de documento y captura

## Lectura del modelo

Las transiciones siguientes representan modos/resoluciones del cliente. Los estados
persistidos llegan de la API y ésta vuelve a comprobar cada operación. Abrir un modo
no cambia inventario ni constituye una aprobación de negocio.

**Identificador:** `DIA-VUE-EST-001`. **Pregunta:** ¿Cómo se decide consulta o edición de una compra?

**Fuente:** usePurchaseActions, canEditPurchase y useDocumentRead. **Notación y alcance:** Diagrama de estados de interacción; los nombres no son valores de status del servidor.

```mermaid
stateDiagram-v2
    [*] --> Lista
    Lista --> Alta: create y permiso
    Lista --> Leyendo: open por ID
    Leyendo --> Consulta: view o documento no editable
    Leyendo --> Edicion: edit y canEditPurchase
    Leyendo --> ErrorLectura: fallo vigente
    ErrorLectura --> Leyendo: retry
    Consulta --> Correccion: detalle activo y permiso
    Consulta --> Cancelacion: detalle activo y permiso
    Correccion --> Consulta: cambio confirmado y recarga
    Cancelacion --> Consulta: confirmación y recarga
    Alta --> Lista: guardado confirmado o cierre
    Edicion --> Lista: guardado confirmado o cierre
    Consulta --> Lista: close
```

**Identificador:** `DIA-VUE-EST-002`. **Pregunta:** ¿Qué modo abre una salida y qué acciones quedan protegidas?

**Fuente:** useIssueActions, resolveIssueEditMode, canSupplyIssue y canReturnIssue. **Notación y alcance:** Estados de interacción del cliente; las guardas representan decisiones del código, no permisos inferidos por la figura.

```mermaid
stateDiagram-v2
    [*] --> Lista
    Lista --> Alta: create con permiso
    Lista --> Leyendo: open con permiso de lectura
    Leyendo --> Consulta: view o edición sin permiso
    Leyendo --> Edicion: edit y modo editable completo
    Leyendo --> Encabezado: edit y detalles protegidos
    Leyendo --> Surtido: supply y permiso y canSupplyIssue
    Leyendo --> Devolucion: return y permiso y canReturnIssue
    Leyendo --> RechazoEstado: supply o return ya no permitido
    RechazoEstado --> Leyendo: reintento tras actualizar
    Alta --> Lista: confirmado o close
    Edicion --> Lista: confirmado o close
    Encabezado --> Lista: confirmado o close
    Surtido --> Lista: confirmado o close
    Devolucion --> Lista: confirmado o close
    Consulta --> Lista: close
```

**Identificador:** `DIA-VUE-EST-003`. **Pregunta:** ¿Cuándo se conserva la captura de merma y cuándo se libera?

**Fuente:** useInventoryEditor y createPendingWasteOperation. **Notación y alcance:** Estados de la captura recuperable, sin afirmar que una cancelación del navegador revierta SQL.

```mermaid
stateDiagram-v2
    [*] --> Captura
    Captura --> GuardadaLocal: save conserva cuerpo y operationId
    GuardadaLocal --> Enviando: execute
    Enviando --> Incierta: red o respuesta no definitiva
    Incierta --> Enviando: reintento con mismo cuerpo e ID
    Incierta --> Incierta: cerrar y recuperar pendiente
    Enviando --> Rechazada: rechazo definitivo conforme a reject
    Rechazada --> Captura: limpiar pendiente y permitir revisión
    Enviando --> Confirmada: respuesta válida
    Confirmada --> [*]: clear y onSaved si vigente
```

La [secuencia de merma](../processes/09-waste-pending.md) explica almacenamiento bloqueado, rechazo definitivo y respuesta tardía.
