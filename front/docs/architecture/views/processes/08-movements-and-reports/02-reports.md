# Reportes: alcance, archivo y error recuperable

**Casos relacionados:** CU de reporte de cada familia; RF-VUE-013.

## Selección del alcance y resultado visible

**Identificador:** `DIA-VUE-SEQ-018`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Dialog@{ "type": "boundary" } as ReportScope<br/>Dialog.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Scope@{ "type": "control" } as useReport<br/>Scope.ts
    participant Export@{ "type": "control" } as useFile<br/>Export.ts
    end
    box Reglas y datos
    participant Rules as report.ts
    end
    U->>Page: nowrap: openReport
    Page->>Scope: nowrap: openReport()
    opt nowrap: options.canExport()
        Scope->>Scope: nowrap: clearErrors()
        Scope->>Scope: nowrap: isReportOpen.value = true
        Scope-->>Page: nowrap: { isReportOpen, reportValues,<br/>reportFormError }
        Page-->>Dialog: nowrap: { values: reportValues, error:<br/>reportFormError }
    end
    U->>Dialog: nowrap: submit
    Dialog->>Page: nowrap: emit('submit')
    Page->>Scope: nowrap: exportReport()
    opt nowrap: options.canExport() && !report.isExporting.value
        Scope->>Rules: nowrap: reportScopeError(reportValues)
        Rules-->>Scope: nowrap: reportFormError
        opt nowrap: !reportFormError.value
            Scope->>Export: nowrap: report.exportReport({ ...reportValues })
            Export-->>Scope: nowrap: undefined
            opt nowrap: !report.exportError.value
                Scope->>Scope: nowrap: isReportOpen.value = false
            end
            Scope-->>Page: nowrap: { isReportOpen, exportError }
        end
    end
```

## Petición y descarga compartida

**Identificador:** `DIA-VUE-SEQ-033`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Export@{ "type": "control" } as useFile<br/>Export.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant Excel@{ "type": "boundary" } as request<br/>Excel.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Export->>Page: nowrap: options.request(scope, current.signal)
    Page->>Service: nowrap: purchaseService.export(props.resource, {<br/>...query }, scope, signal)
    Service->>Excel: nowrap: requestExcel(url, signal)
    Excel->>HTTP: nowrap: apiClient.request(url, { signal,<br/>responseType: 'blob' })
    HTTP->>API: nowrap: GET<br/>/api/warehouse/reports/goods-receipts/{resource}/excel?{params}
    API-->>HTTP: nowrap: Blob
    HTTP-->>Excel: nowrap: file
    alt nowrap: !(file instanceof Blob) || !file.type.includes(<br/>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        Excel-->>Service: nowrap: throw Error
        Service-->>Page: nowrap: throw Error
        Page-->>Export: nowrap: throw cause
        Export->>Export: nowrap: exportError.value = cause.message
    else
        Excel-->>Service: nowrap: file
        Service-->>Page: nowrap: file
        Page-->>Export: nowrap: file
        opt nowrap: !current.signal.aborted
            Export->>Export: nowrap: URL.createObjectURL(file)
            Export->>Export: nowrap: link.href = url
            Export->>Export: nowrap: link.download = options.filename
            Export->>Export: nowrap: link.click()
            Export->>Export: nowrap: setTimeout(() => URL.revokeObjectURL(url),<br/>1000)
        end
    end
    Export->>Export: nowrap: isExporting.value = false
```

## Descarga directa de Directorio

**Identificador:** `DIA-VUE-SEQ-046`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Directory<br/>Page.vue
    participant Export@{ "type": "control" } as useFile<br/>Export.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    participant Excel@{ "type": "boundary" } as request<br/>Excel.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    U->>Page: nowrap: exportReport
    Page->>Export: nowrap: report.exportReport()
    opt nowrap: options.canExport() && !isExporting.value &&<br/>!isDisposed
        Export->>Page: nowrap: options.request(scope, current.signal)
        Page->>Service: nowrap: directoryService.export(props.resource, {<br/>...query }, signal)
        Service->>Excel: nowrap: requestExcel(<br/>DIRECTORY_CONFIG[resource].reportPath +<br/>'?' + recordParams(query, { paginate:<br/>false }), signal)
        Excel->>HTTP: nowrap: apiClient.request(url, { signal,<br/>responseType: 'blob' })
        HTTP->>API: nowrap: GET {url}
        API-->>HTTP: nowrap: Blob
        HTTP-->>Excel: nowrap: file
        alt nowrap: file instanceof Blob && file.type.includes(<br/>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            Excel-->>Service: nowrap: file
            Service-->>Page: nowrap: file
            Page-->>Export: nowrap: file
            opt nowrap: !current.signal.aborted
                Export->>Export: nowrap: URL.createObjectURL(file)
                Export->>Export: nowrap: link.click()
                Export->>Export: nowrap: setTimeout(() => URL.revokeObjectURL(url),<br/>1000)
            end
        else
            Excel-->>Service: nowrap: throw Error
            Service-->>Page: nowrap: throw Error
            Page-->>Export: nowrap: throw cause
            Export->>Export: nowrap: exportError.value = cause.message
        end
        Export->>Export: nowrap: isExporting.value = false
        Export-->>Page: nowrap: { isExporting, exportError }
    end
```

## Fuentes de los participantes

[ReportScopeDialog.vue](../../../../../src/shared/components/ReportScopeDialog.vue),
[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[useReportScope.ts](../../../../../src/shared/composables/useReportScope.ts),
[useFileExport.ts](../../../../../src/shared/composables/useFileExport.ts),
[report.ts](../../../../../src/shared/report.ts),
[DirectoryPage.vue](../../../../../src/modules/directory/pages/DirectoryPage.vue),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[requestExcel.ts](../../../../../src/shared/http/requestExcel.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
