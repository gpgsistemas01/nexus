<a id="cu-cat-01"></a>
# `CU-CAT-01` — Consultar proveedores

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/views/pages/warehouse/suppliers/suppliersPage.ejs<br/>src/public/js/pages/warehouse/suppliers/suppliersPage.js
    participant Application as src/public/js/application/warehouse/suppliers/suppliers.js
    participant Request as src/public/js/services/warehouse/supplierService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/supplierApiRoute.js<br/>src/controllers/api/warehouse/supplierController.js

    Browser->>View: suppliersPage.ejs y suppliersPage.js cargan proveedores
    View->>Application: getAllSuppliers({ params })
    Application->>Request: getAllSuppliersRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/suppliers
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: getAllSuppliersRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: getAllSuppliers() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

