<a id="cu-ida-07"></a>
# `CU-IDA-07` — Editar usuario y acceso

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`userModal.js`](../../../../../../src/public/js/pages/admin/users/userModal.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`userService.js`](../../../../../../src/public/js/services/admin/userService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`userApiRoute.js`](../../../../../../src/routes/api/admin/userApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-IDA-07`](../../backend-code-sequences/identity-access/cu-ida-07.md#cu-ida-07): [`userController.js`](../../../../../../src/controllers/api/admin/userController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`users.js`](../../../../../../src/public/js/application/admin/users/users.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-IDA-07 — Editar usuario y acceso
    Browser->>View: userModal.js abre la cuenta y acceso existentes
    View->>FormUtils: validateFields(userEditValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    alt userEditValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editUser({ id, formData })
        activate Application
        Application->>Request: editUserRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/admin/users/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { datos y código de operación }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editUserRequest(): Promise[AxiosResponse]
            Application-->>View: editUser(): Promise[{ message: string, data: User }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

