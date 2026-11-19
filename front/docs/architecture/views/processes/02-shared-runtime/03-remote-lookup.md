# Búsqueda, paginación y selección remota

**Pregunta:** ¿cómo se actualizan las opciones de un selector desde el servidor sin
mostrar resultados obsoletos? **Aplicaciones:** selectores de Compras, Salidas, Almacén
y Directorio.

## Apertura y primera carga

**Identificador:** `DIA-VUE-SEQ-058`. La página evita repetir una consulta ya solicitada o
que sigue en curso.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Select@{ "type": "boundary" } as Selector remoto
    participant Page@{ "type": "control" } as Página del recurso
    participant Lookup@{ "type": "control" } as Estado de búsqueda
    participant Service@{ "type": "boundary" } as Servicio de consulta
    participant API@{ "type": "boundary" } as API
    Usuario->>Select: abrir opciones
    Select->>Page: solicitar búsqueda vigente
    Page->>Lookup: actualizar consulta
    alt No hay resultados cargados ni solicitud en curso
        Lookup->>Service: pedir la primera página
        Service->>API: consultar opciones del recurso
        API-->>Service: opciones y conteo
        Service-->>Lookup: página recibida
        Lookup-->>Page: opciones y estado de carga
        Page-->>Select: mostrar resultados
    else Ya hay una consulta vigente
        Lookup-->>Page: conservar resultados y carga actuales
    end
```

## Escritura, paginación y recuperación

**Identificador:** `DIA-VUE-SEQ-010`.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Select@{ "type": "boundary" } as Selector remoto
    participant Page@{ "type": "control" } as Página del recurso
    participant Lookup@{ "type": "control" } as Estado de búsqueda
    participant Service@{ "type": "boundary" } as Servicio de consulta
    participant API@{ "type": "boundary" } as API
    Usuario->>Select: escribir una búsqueda
    Select->>Page: emitir texto de búsqueda
    Page->>Lookup: reemplazar consulta y reiniciar páginas
    Note over Lookup: esperar 500 ms y cancelar la petición anterior
    Lookup->>Service: solicitar página para la búsqueda vigente
    Service->>API: consultar opciones del recurso
    API-->>Service: página, conteo o error
    Service-->>Lookup: devolver resultado
    alt La respuesta pertenece a la consulta actual
        Lookup-->>Page: actualizar opciones y disponibilidad de más páginas
        Page-->>Select: presentar opciones o acción de reintento
    else La respuesta llegó tarde o se canceló
        Lookup-->>Page: ignorar resultado obsoleto
    end
    opt El usuario llega al final de las opciones
        Select->>Page: solicitar más resultados
        Page->>Lookup: cargar la siguiente página
    end
```

`RemoteSelect` conserva la selección por ID aunque la página visible de opciones cambie.
Un error de lectura recuperable habilita **Reintentar**; la nueva lectura usa la página
solicitada. `refresh` sirve a las altas contextuales para actualizar opciones después
de crear un registro.

## Fuentes

[RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[useSelectedOption.ts](../../../../../src/shared/composables/useSelectedOption.ts),
[purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts),
[issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts),
[pageRequest.ts](../../../../../src/shared/http/pageRequest.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
