<a id="cu-ida-07"></a>
# `CU-IDA-07` — Editar usuario y acceso

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`userModal.js`](../../../../../../src/public/js/pages/admin/users/userModal.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`userService.js`](../../../../../../src/public/js/services/admin/userService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`userApiRoute.js`](../../../../../../src/routes/api/admin/userApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileUserController` | control | [`userController.js`](../../../../../../src/controllers/api/admin/userController.js) |
| `FileUsers` | control | [`users.js`](../../../../../../src/public/js/application/admin/users/users.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-IDA-07`](../../backend-code-sequences/identity-access/cu-ida-07.md#cu-ida-07): [`userController.js`](../../../../../../src/controllers/api/admin/userController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`users.js`](../../../../../../src/public/js/application/admin/users/users.js); exportar esa función no crea otra llamada durante cada petición.

Las llamadas internas de los helpers se amplían una vez en las
[colaboraciones CRUD compartidas](../../shared-runtime-behavior/03-crud-helper-collaborations.md). Sus archivos siguen representados
por separado en las figuras y la tabla de este caso.

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileUserController["userController.js"]
        Transport["userApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        FileUsers["users.js"]
        Application["createCrudApplication.js"]
        Request["userService.js"]
    end
    FileUtils -->|import| FileApiMessages
    FileUsers -->|import| Request
    FileUsers -->|import| Application
    FormUtils -->|import| FileApiMessages
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileUserController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editUser` | `FileUsers` | `Application` · `createCrudApplication(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as userModal.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as userService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as userApiRoute.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Initiator->>Browser: inicia CU-IDA-07 — Editar usuario y acceso
    Browser->>View: userModal.js abre la cuenta y acceso existentes
    View->>FormUtils: validateFields(userEditValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    alt userEditValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editUser({ id, formData })
        activate Application
        Application->>Request: editUserRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/admin/users/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { datos y código de operación }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editUserRequest(): Promise[AxiosResponse]
            Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
            FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
            Application-->>View: editUser(): Promise[{ message: string, data: User }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            opt No se inicia renovación: status distinto de 401 o request._retry
                HTTP->>FileUtils: normalizeHttpError(err)
                FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
            end
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
