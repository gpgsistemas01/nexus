<a id="cu-ida-08"></a>
# `CU-IDA-08` — Cambiar contraseña de usuario

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/admin/users/userForm.js
    participant Application@{ "type": "control" } as src/public/js/application/admin/users/users.js
    participant Request as src/public/js/services/admin/userService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/userApiRoute.js<br/>src/controllers/api/admin/userController.js

    Initiator->>Browser: inicia CU-IDA-08 — Cambiar contraseña de usuario
    Browser->>View: userForm.js selecciona el modo de contraseña
    View->>View: validateFields(userPasswordValidation, formData)
    alt userPasswordValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editUserPassword({ id, formData })
        activate Application
        Application->>Request: editUserPasswordRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/admin/users/:id/password
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editUserPasswordRequest(): Promise[AxiosResponse]
            Application-->>View: editUserPassword(): Promise[{ message: string }]
            View-->>Browser: handleSubmit(): confirmar, cerrar modal y recargar listado
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
