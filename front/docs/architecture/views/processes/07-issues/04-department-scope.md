# Alcance de área: selección inicial y campo bloqueado

## Escenario y contratos

**Identificador:** `DIA-VUE-SEQ-026`. **Pregunta:** ¿Cómo se adapta el área de
filtro/captura al alcance real sin inferirlo desde el nombre del rol?
**Casos relacionados:** consulta y creación de CU-SAL; RN de autorización y selección.
**Fuentes:** [useIssueDepartments.ts](../../../../../src/modules/issues/composables/useIssueDepartments.ts),
[useIssueHeaderSelection.ts](../../../../../src/modules/issues/composables/useIssueHeaderSelection.ts),
[useIssueFilters.ts](../../../../../src/modules/issues/composables/useIssueFilters.ts),
[issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts).
**Notación:** secuencia; el total del catálogo sin búsqueda determina la adaptación visual,
no una autorización independiente de la API.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Scope@{ "type": "control" } as useIssue<br/>Departments.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issueLookup<br/>Service.ts
    participant Paged@{ "type": "boundary" } as page<br/>Request.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Scope->>Lookup: crear lookup habilitado por isEnabled
    Lookup->>Scope: request(search, page, signal) configurado
    Scope->>Service: list(departments, resource, search, page, signal)
    Service->>Paged: requestPage con context issues
    Paged->>HTTP: request(url, signal)
    HTTP->>API: GET /api/admin/departments?context=issues
    API-->>HTTP: filas y conteos autorizados
    HTTP-->>Paged: cuerpo JSON
    Paged-->>Service: PageResult validado
    Service-->>Scope: PageResult de LookupItem
    Scope->>Scope: fijar singleDepartment sólo sin búsqueda y en página 1
    Scope-->>Lookup: resultado del callback
    Lookup->>Lookup: publicar items y hasMore
```

## Adaptación de captura y filtros

**Identificador:** `DIA-VUE-SEQ-030`. **Pregunta:** ¿Cuándo se preselecciona,
bloquea y conserva el área? **Fuente:** el watch de `useIssueDepartments` y sus callbacks
de encabezado/filtros. **Notación:** colaboración reactiva después de publicar opciones.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Scope@{ "type": "control" } as useIssue<br/>Departments.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    participant Header@{ "type": "control" } as useIssue<br/>Header<br/>Selection.ts
    participant Filters@{ "type": "control" } as useIssue<br/>Filters.ts
    end
    Lookup-->>Scope: items actualizados
    opt habilitado, área única publicada y selección vacía
        alt instancia usada por encabezado
            Scope->>Header: selectDefault(id) configurado
            alt sin documento existente
                Header->>Header: setHeaderField(departmentId, id)
            else edición
                Header->>Header: conservar área del documento
            end
        else instancia usada por filtros
            Scope->>Filters: selectDefault(id) configurado
            Filters->>Filters: precargar departmentId
        end
    end
    alt consumidor de encabezado
        Scope-->>Header: isLocked de su instancia
    else consumidor de filtros
        Scope-->>Filters: isLocked de su instancia
    end
    Note over Header,Filters: Cada consumidor tiene su propio lookup, una búsqueda no redefine el alcance
```

| Decisión | Condición exacta |
| --- | --- |
| Alcance único | Página 1 sin búsqueda, señal vigente, `recordsFiltered === 1`, una fila y no deshabilitada. |
| Preselección | Habilitado, área única ya incluida en `items` y selección vacía. |
| Callback de encabezado | Asigna sólo cuando no hay documento, conservando el área en edición. |
| Bloqueo | Existe área única y `getSelectedId()` coincide con ella; se combina con otras restricciones del campo. |
| Limpieza de filtros | Conserva `departmentId` si bloqueado y reinicia los otros campos/búsquedas. |
| Búsqueda paginada | No redefine el alcance por encontrar una única coincidencia. |

El request completo del catálogo usa `/api/admin/departments?context=issues` con
búsqueda vacía y página inicial. La instantánea se calcula en el callback que espera
el servicio, antes de que `useRemoteLookup` publique `items`. El watch espera la opción
publicada antes de invocar el callback; no representa una llamada HTTP adicional.

## Decisiones y rechazo

Esperar a `lookup.items` conserva la etiqueta y evita mostrar temporalmente el UUID.
Si falla el catálogo, el selector presenta error/reintento y no inventa un área
predeterminada. Las capacidades del formulario pueden deshabilitar el campo por otros
motivos, además de `isLocked`.

La política de cuenta y alcance se comprueba en la API para consulta y escritura,
incluso si una solicitud manipulada cambia `departmentId`. El cliente sólo adapta
la interacción al catálogo autorizado. La figura no concede surtidos ni devoluciones
a las áreas operativas. La evidencia del cliente está en
[issueDepartmentsTest.ts](../../../../../tests/unit/modules/issues/issueDepartmentsTest.ts);
el [dominio](../../../../requirements/domain-model/01-identity-and-organization.md)
explica cuenta, persona y asignaciones.

## Fuentes de los participantes

[useIssueDepartments.ts](../../../../../src/modules/issues/composables/useIssueDepartments.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts),
[pageRequest.ts](../../../../../src/shared/http/pageRequest.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[useIssueHeaderSelection.ts](../../../../../src/modules/issues/composables/useIssueHeaderSelection.ts),
[useIssueFilters.ts](../../../../../src/modules/issues/composables/useIssueFilters.ts).
