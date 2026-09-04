# Secuencias del código frontend: Identidad y acceso

Este capítulo forma parte del [catálogo de secuencias del código frontend](index.md) y conserva los recorridos aplicados del grupo `IDA`. Las reglas comunes de lectura, trazabilidad y mantenimiento se declaran en el índice de la colección.

## `CU-IDA-01`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/views/pages/admin/persons/personsPage.ejs<br/>src/public/js/pages/admin/persons/personsPage.js
    participant Application as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: personsPage.ejs y personsPage.js cargan la tabla
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllPersons({ params })
    Application->>Request: getAllPersonsRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consulta GET /api/admin/persons
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

## `CU-IDA-02`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/persons/personModal.js<br/>src/public/js/pages/admin/persons/personForm.js
    participant Application as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js
    Note over Application,Transport: Variables de frontera: formData/payload

    Browser->>View: personModal.js abre personForm.js en modo alta
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: registerPerson({ formData })
    Application->>Request: registerPersonRequest({ formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'post', url, data/params })
    HTTP->>Transport: envía POST /api/admin/persons
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

## `CU-IDA-03`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/persons/personModal.js
    participant Application as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js
    Note over Application,Transport: Variables de frontera: id, formData/payload

    Browser->>View: personModal.js precarga la persona seleccionada
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: updatePerson({ id, formData })
    Application->>Request: updatePersonRequest({ id, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'put', url, data/params })
    HTTP->>Transport: envía PUT /api/admin/persons/:id
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

## `CU-IDA-04`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/views/pages/admin/users/usersPage.ejs<br/>src/public/js/pages/admin/users/usersPage.js
    participant Application as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: usersPage.ejs y usersPage.js cargan la tabla
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllUsers({ params })
    Application->>Request: getAllUsersRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consulta GET /api/admin/users
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

## `CU-IDA-05`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/users/userModal.js<br/>src/public/js/pages/admin/users/userForm.js
    participant Application as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js
    Note over Application,Transport: Variables de frontera: formData/payload

    Browser->>View: userModal.js abre userForm.js para una cuenta nueva
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: registerUser({ formData })
    Application->>Request: registerUserRequest({ formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'post', url, data/params })
    HTTP->>Transport: envía POST /api/admin/users
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

## `CU-IDA-06`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/users/userModal.js
    participant Application as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js
    Note over Application,Transport: Variables de frontera: id, formData/payload

    Browser->>View: userModal.js abre la cuenta y acceso existentes
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: editUser({ id, formData })
    Application->>Request: editUserRequest({ id, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'patch', url, data/params })
    HTTP->>Transport: envía PATCH /api/admin/users/:id
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

## `CU-IDA-07`

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/users/userForm.js
    participant Application as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js
    Note over Application,Transport: Variables de frontera: id, formData/payload

    Browser->>View: userForm.js selecciona el modo de contraseña
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: editUserPassword({ id, formData })
    Application->>Request: editUserPasswordRequest({ id, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'patch', url, data/params })
    HTTP->>Transport: envía PATCH /api/admin/users/:id/password
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

## `CU-IDA-08`

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/select2/domains/role.js
    participant Application as src/public/js/application/admin/catalogs/roles.js
    participant Request as src/public/js/services/admin/roleService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/roleApiRoute.js<br/>src/controllers/api/admin/roleController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: Select de rol dentro de formularios de personas y usuarios
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllRoles({ params })
    Application->>Request: getAllRolesRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consume GET /api/admin/roles
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

## `CU-IDA-09`

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
