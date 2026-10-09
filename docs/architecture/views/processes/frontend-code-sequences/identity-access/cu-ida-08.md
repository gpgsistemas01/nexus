<a id="cu-ida-08"></a>
# `CU-IDA-08` — Cambiar contraseña de usuario

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`userForm.js`](../../../../../../src/public/js/pages/admin/users/userForm.js) |
| `Application` | control | [`users.js`](../../../../../../src/public/js/application/admin/users/users.js) |
| `Request` | boundary | [`userService.js`](../../../../../../src/public/js/services/admin/userService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`userApiRoute.js`](../../../../../../src/routes/api/admin/userApiRoute.js)<br/>[`userController.js`](../../../../../../src/controllers/api/admin/userController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

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
            Transport-->>HTTP: HTTP 200 { datos y código de operación }
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
