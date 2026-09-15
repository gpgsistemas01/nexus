<a id="cu-ida-11"></a>
# `CU-IDA-11` — Consultar departamentos

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/select2/domains/department.js
    participant Application as src/public/js/application/admin/catalogs/departments.js
    participant Request as src/public/js/services/admin/departmentService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/departmentApiRoute.js<br/>src/controllers/api/admin/departmentController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: Select de departamento dentro de formularios de personas y usuarios
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllDepartments({ params })
    Application->>Request: getAllDepartmentsRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consume GET /api/admin/departments
    Transport-->>HTTP: status HTTP y payload del endpoint
    HTTP-->>Request: respuesta o error normalizado
    Request-->>Application: resultado del request
    alt Respuesta exitosa
        Application-->>View: entidad, colección o archivo normalizado
        View-->>Browser: actualizar la vista con el resultado
    else Respuesta rechazada
        Application-->>View: error normalizado por apiRequest
        View-->>Browser: conservar contexto y mostrar el mensaje
    end
    deactivate Application
```
