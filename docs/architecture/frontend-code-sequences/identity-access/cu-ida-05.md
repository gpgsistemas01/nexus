<a id="cu-ida-05"></a>
# `CU-IDA-05` — Consultar usuarios

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/views/pages/admin/users/usersPage.ejs<br/>src/public/js/pages/admin/users/usersPage.js
    participant Application as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js

    Browser->>View: usersPage.ejs y usersPage.js cargan la tabla
    View->>Application: getAllUsers({ params })
    Application->>Request: getAllUsersRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/admin/users
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: getAllUsersRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: getAllUsers() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

