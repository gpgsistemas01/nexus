# Alcance de área: selección inicial y campo bloqueado

**Casos relacionados:** consulta y creación de CU-SAL; RN de autorización y selección.

## Escenario y contratos

**Identificador:** `DIA-VUE-SEQ-026`.

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
    Scope->>Lookup: nowrap: useRemoteLookup(request, computed(<br/>options.isEnabled))
    Lookup->>Scope: nowrap: request(search.value, nextPage,<br/>requestController.signal)
    Scope->>Service: nowrap: issueLookupService.list('departments',<br/>options.resource, search, page, signal)
    Service->>Paged: nowrap: requestPage(url, signal)
    Paged->>HTTP: nowrap: apiClient.request(url, { signal })
    HTTP->>API: nowrap: GET /api/admin/departments?context=issues
    API-->>HTTP: nowrap: { data, recordsFiltered, recordsTotal }
    HTTP-->>Paged: nowrap: page
    Paged-->>Service: nowrap: page
    Service-->>Scope: nowrap: result
    opt nowrap: !signal.aborted && !search && page === 1
        Scope->>Scope: nowrap: singleDepartment.value =<br/>result.recordsFiltered === 1 &&<br/>result.data.length === 1 &&<br/>!item?.isDisabled ? item : undefined
    end
    Scope-->>Lookup: nowrap: result
    Lookup->>Lookup: nowrap: items.value = [...previous, ...additions]
```

## Adaptación de captura y filtros

**Identificador:** `DIA-VUE-SEQ-030`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Scope@{ "type": "control" } as useIssue<br/>Departments.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    participant Header@{ "type": "control" } as useIssue<br/>Header<br/>Selection.ts
    participant Filters@{ "type": "control" } as useIssue<br/>Filters.ts
    end
    Lookup-->>Scope: nowrap: lookup.items
    opt nowrap: options.isEnabled() && singleDepartment.value &&<br/>lookup.items.value.some((item) => item.id ===<br/>singleDepartment.value?.id) && !options.getSelectedId(<br/>)
        alt nowrap: useIssueHeaderSelection
            Scope->>Header: nowrap: options.selectDefault(<br/>singleDepartment.value.id)
            opt nowrap: !options.document
                Header->>Header: nowrap: options.setHeaderField('departmentId', id)
            end
        else nowrap: useIssueFilters
            Scope->>Filters: nowrap: options.selectDefault(<br/>singleDepartment.value.id)
            Filters->>Filters: nowrap: values.departmentId = id
        end
    end
    alt nowrap: useIssueHeaderSelection
        Scope-->>Header: nowrap: isLocked
    else nowrap: useIssueFilters
        Scope-->>Filters: nowrap: isLocked
    end
```

## Fuentes de los participantes

[useIssueDepartments.ts](../../../../../src/modules/issues/composables/useIssueDepartments.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts),
[pageRequest.ts](../../../../../src/shared/http/pageRequest.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[useIssueHeaderSelection.ts](../../../../../src/modules/issues/composables/useIssueHeaderSelection.ts),
[useIssueFilters.ts](../../../../../src/modules/issues/composables/useIssueFilters.ts).
