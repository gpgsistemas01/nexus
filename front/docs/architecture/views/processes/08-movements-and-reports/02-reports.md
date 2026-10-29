# Reportes: alcance, archivo y error recuperable

## Escenario y contratos

**Casos relacionados:** CU de reporte de cada familia; RF-VUE-013.

## Selección del alcance y resultado visible

**Identificador:** `DIA-VUE-SEQ-018`. La primera figura desarrolla Compras; Salidas y Movimientos reutilizan el mismo
contrato de `useReportScope`. La descarga se amplía en `SEQ-033`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Dialog@{ "type": "boundary" } as ReportScope<br/>Dialog.vue
    participant Page@{ "type": "boundary" } as Purchase<br/>Page.vue
    end
    box Coordinación
    participant Scope@{ "type": "control" } as useReport<br/>Scope.ts
    participant Export@{ "type": "control" } as useFile<br/>Export.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as report.ts
    end
    U->>Page: Exportar Excel
    Page->>Scope: openReport()
    Scope-->>Page: isReportOpen
    Page->>Dialog: valores y estado por props
    U->>Dialog: elegir alcance y Descargar Excel
    Dialog->>Page: mode, month y submit
    Page->>Scope: setReportMode, setReportMonth y exportReport()
    Scope->>Rules: reportScopeError(reportValues)
    Rules-->>Scope: mensaje o captura admitida
    alt permiso, mes y estado admitidos
        Scope->>Export: exportReport(copia de reportValues)
        Note over Export: Callback de PurchasePage y descarga en SEQ-033
        Export-->>Scope: operación terminada, exportError
        alt sin error
            Scope-->>Page: isReportOpen false
        else error
            Scope-->>Page: conservar diálogo y presentar exportError
        end
    else no admitido
        Scope-->>Page: error de campo o sin nueva descarga
    end
```

Un mes inválido detiene la operación antes de llamar al exportador; el usuario puede
corregirlo sin abandonar el diálogo. Cada descarga utiliza los criterios admitidos
por ese reporte, no necesariamente todos los filtros que aparecen en la tabla.

## Petición y descarga compartida

**Identificador:** `DIA-VUE-SEQ-033`. Amplía la llamada a `useFileExport` configurada por `PurchasePage`.
Las descargas directas usan el mismo exportador, con el servicio de su recurso.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Page@{ "type": "boundary" } as Purchase<br/>Page.vue
    end
    box Coordinación
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
    Export->>Page: request(scope, signal) configurado
    Page->>Service: export(resource, query, scope, signal)
    Service->>Service: validar alcance y construir parámetros sin paginación
    Service->>Excel: requestExcel(endpoint y parámetros, signal)
    Excel->>HTTP: request con responseType blob
    HTTP->>API: GET reporte de compras
    API-->>HTTP: archivo o rechazo HTTP
    HTTP-->>Excel: Blob o ApiError
    alt archivo Excel admitido
        Excel->>Excel: comprobar Blob y MIME
        Excel-->>Service: Blob validado
        Service-->>Page: archivo
        Page-->>Export: resultado del callback
        Export->>Export: descargar y programar liberación de URL
    else fallo o archivo inesperado
        Excel-->>Service: error normalizado o Error de archivo
        Service-->>Page: propagar error
        Page-->>Export: rechazo del callback
        Export->>Export: establecer exportError y notificar onDenied si aplica
    end
```

## Descarga directa de Directorio

**Identificador:** `DIA-VUE-SEQ-046`. **Pregunta:** ¿Cómo se descarga un reporte sin
abrir el selector de alcance? **Fuente:** `DirectoryPage`, `directoryService` y
los mismos adaptadores compartidos de archivo y HTTP.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Directory<br/>Page.vue
    end
    box Coordinación
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
    U->>Page: Exportar Excel con criterios aplicados
    Page->>Export: exportReport()
    Export->>Page: request con signal configurado
    Page->>Service: export(resource, copia de query, signal)
    Service->>Excel: requestExcel con recordParams sin paginación
    Excel->>HTTP: request con responseType blob
    HTTP->>API: GET reporte de clientes o proveedores
    API-->>HTTP: archivo o rechazo
    HTTP-->>Excel: Blob o ApiError
    Excel->>Excel: comprobar formato antes de devolver archivo
    Excel-->>Service: Blob admitido o error
    Service-->>Page: resolver o rechazar export
    Page-->>Export: resultado del callback
    Export-->>Page: isExporting y exportError
    Note over Export: Sólo un archivo admitido inicia descarga y liberación de URL
```

| Descarga directa | Propietario del callback configurado en useFileExport | Servicio |
| --- | --- | --- |
| Clientes y proveedores | `DirectoryPage.vue`. | `directoryService.export`. |
| Personas y cuentas | `IdentityPage.vue`. | `identityService.export`; Personas rechaza el filtro de rol no admitido. |
| Materiales, consumibles y mermas | `useInventoryReport.ts`, compuesto por `useInventory.ts`. | `inventoryReportService.export`, con `inventoryScope`. |

## Reglas y recuperación

Los módulos con descarga directa usan useFileExport sin diálogo de alcance. Personas bloquea el filtro de rol no admitido por su API de exportación. El contenido real de XLSX requiere sistema, no un blob simulado.

## Evidencia

reportScopeTest.ts, inventoryReportTest.ts, records.spec.ts y application.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

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
