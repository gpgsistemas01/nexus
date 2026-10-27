# Búsqueda, paginación y selección remota

## Escenario y contratos

**Casos relacionados:** RD-VUE-006; RN-VUE-003/005; soporte de captura.

**Fuente técnica:** useRemoteLookup.ts, useSelectedOption.ts y RemoteSelect.vue. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-010`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Select as RemoteSelect y Page
    participant Lookup as useRemoteLookup
    participant Service as servicio lookup del recurso
    participant Selection as useSelectedOption
    Usuario->>Select: escribir búsqueda
    Select->>Lookup: updateSearch
    Lookup->>Lookup: invalidar, abortar, reiniciar y esperar 250 ms
    Lookup->>Service: request(search, página 1, signal)
    Service-->>Lookup: PageResult
    Lookup->>Lookup: deduplicar IDs y contar filas recibidas
    Lookup-->>Select: opciones y hasMore
    Select->>Selection: ID seleccionado y opciones
    Selection-->>Select: etiqueta/datos vigentes aun fuera de página
    Usuario->>Select: llegar al final
    Select->>Lookup: loadMore si habilitado y sin error/carga
    Lookup->>Service: request siguiente página
    alt respuesta vigente
        Service-->>Lookup: filas y conteo
        Lookup-->>Select: añadir únicas o terminar si página vacía
    else fallo
        Service-->>Lookup: error
        Lookup-->>Select: error sin adelantar página
        Usuario->>Select: Reintentar
        Select->>Lookup: retry de requestedPage
    end
```

## Reglas y recuperación

Cambiar dependencia reinicia búsqueda/opciones; desmontar limpia timer y aborta/invalida. La selección pertenece al consumidor y no autoriza el registro ni fabrica su ID.

## Evidencia

remoteLookupTest.ts, selectedOptionTest.ts y selectCreation.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
