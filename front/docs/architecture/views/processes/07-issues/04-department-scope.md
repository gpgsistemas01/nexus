# Alcance de área en consultas y capturas

**Pregunta:** ¿cómo aplica Vue el área autorizada en filtros y documentos de Salidas?
**Casos relacionados:** `CU-SAL-01..05`, `CU-SAL-08..12`, `CU-SAL-15..20`.

## Selección inicial

**Identificador:** `DIA-VUE-SEQ-026`.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "control" } as Página de Salidas
    participant Scope@{ "type": "control" } as Alcance de área
    participant Lookup@{ "type": "control" } as Búsqueda remota
    participant Service@{ "type": "boundary" } as Consulta de Salidas
    participant API@{ "type": "boundary" } as API
    Page->>Scope: iniciar filtros o captura para el recurso
    Scope->>Lookup: cargar áreas disponibles
    Lookup->>Service: solicitar página de áreas
    Service->>API: consultar áreas permitidas para Salidas
    API-->>Service: áreas autorizadas y conteo
    Service-->>Lookup: página de áreas
    Lookup-->>Scope: resultados vigentes
    alt La cuenta tiene una sola área activa y aún no hay selección
        Scope->>Page: seleccionar esa área y bloquear el selector
    else Hay varias áreas o una selección existente
        Scope->>Page: conservar la selección y permitir opciones autorizadas
    end
```

## Aplicación a filtros y encabezado

**Identificador:** `DIA-VUE-SEQ-030`.

```mermaid
sequenceDiagram
    autonumber
    participant Page@{ "type": "control" } as Página de Salidas
    participant Scope@{ "type": "control" } as Alcance de área
    participant Consumer@{ "type": "control" } as Filtros o encabezado
    alt El lookup devuelve una sola área activa sin selección previa
        Scope->>Consumer: aplicar el área autorizada por defecto
        Scope-->>Consumer: indicar que el área no se puede cambiar
    else La cuenta puede elegir entre varias áreas
        Scope-->>Consumer: mantener la selección disponible
    end
    Consumer-->>Page: exponer filtro o encabezado actualizado
```

El API determina las áreas que se pueden consultar y validar; la selección visual sólo
preselecciona y bloquea el selector cuando corresponde. El alcance enviado por el
cliente no sustituye la autorización del servidor.

## Fuentes

[useIssueDepartments.ts](../../../../../src/modules/issues/composables/useIssueDepartments.ts),
[useIssueFilters.ts](../../../../../src/modules/issues/composables/useIssueFilters.ts),
[useIssueHeaderSelection.ts](../../../../../src/modules/issues/composables/useIssueHeaderSelection.ts),
[issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts).
