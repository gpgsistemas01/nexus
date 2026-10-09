# 2. Sesión HTTP y estados técnicos de formularios

Esta sección conserva el comportamiento compartido y los estados locales que no son
estados de negocio. Los archivos y dependencias de cada módulo están en desarrollo.

### Estados técnicos complementarios

Estos diagramas describen los estados del formulario durante la interacción, como
complemento de las secuencias por caso de uso.

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-IDA-08`. El objeto modelado es
el modal en modo contraseña (`FORM_MODES.EDIT_PASSWORD`), abierto desde la consulta.
El formulario conserva ese modo ante un error que permite reintentar el envío; no cambia al modo de edición de
datos ni modela el estado persistido del usuario.

```mermaid
stateDiagram-v2
    state "Consulta (modal cerrado)" as Consulta
    state "Contraseña abierta (edit-password)" as Password
    state "Enviando contraseña" as Enviando
    state "Formulario bloqueado tras error" as Bloqueado
    state "Fuera de la página" as Fuera
    [*] --> Consulta: abrir usuarios
    Consulta --> Password: abrir contraseña / deshabilitar campos de identidad
    Password --> Password: validar [datos inválidos] / mostrar errores
    Password --> Enviando: enviar [password válido] / editUserPassword()
    Enviando --> Consulta: resolver [éxito] / cerrar y recargar
    Enviando --> Password: rechazar [HTTP recuperable] / habilitar reintento
    Enviando --> Bloqueado: rechazar [otro error sin redirección] / notificar
    Enviando --> Fuera: sesión perdida / redirigir a raíz
    Password --> Consulta: cerrar modal
    Bloqueado --> Consulta: cerrar modal
    Fuera --> [*]
```

La elección del modo ocurre en `userModal.js`; la validación y la mutación se seleccionan
en `userForm.js`. `handleSubmit` cierra el modal y recarga la tabla sólo tras el éxito.
`handleApiError` permite reintentar HTTP 400, 403, 404 y 409; la figura los agrupa
como «HTTP recuperable». Para los demás fallos, la implementación actual notifica sin restablecer `submitting`: cerrar y volver
a abrir el modal inicializa el formulario. El cliente HTTP intenta renovar una sesión
ante 401 antes de abandonar la página.

**Estado técnico complementario:** `DIA-FE-TEC-EST-CU-ALM-05`. Modela el modal de ajuste
abierto desde Materiales. El servidor comprueba el permiso y la existencia disponible antes de aplicar el ajuste;
la validación local del formulario no sustituye esas comprobaciones.

```mermaid
stateDiagram-v2
    state "Consulta de materiales (modal cerrado)" as Consulta
    state "Ajuste abierto (edit-stock)" as Ajuste
    state "Enviando ajuste (submitting=true)" as Enviando
    state "Formulario bloqueado tras error" as Bloqueado
    state "Fuera de la página de materiales" as Fuera
    [*] --> Consulta: abrir la página
    Consulta --> Ajuste: abrir ajuste / openMaterialModal(edit-stock)
    Ajuste --> Ajuste: validar [datos inválidos] / mostrar errores
    Ajuste --> Enviando: enviar [datos válidos] / editMaterialStock()
    Enviando --> Consulta: resolver [éxito] / cerrar, recargar y onSave
    Enviando --> Ajuste: rechazar [HTTP recuperable] / habilitar reintento
    Enviando --> Bloqueado: rechazar [otro error sin redirección] / notificar
    Enviando --> Fuera: sesión perdida / redirigir a raíz
    Bloqueado --> Consulta: cerrar modal
    Ajuste --> Consulta: cerrar el modal
    Fuera --> [*]
    note right of Enviando
        Un segundo submit no crea otra petición.
        No hay un estado persistido llamado Ajuste o Inválido.
    end note
```

La evidencia está en `materialModal.js`, `materialForm.js`, `formUI.js`, `formUtils.js`
y `api/errorHandler.js`. Ante HTTP 400, 403, 404 y 409, el manejador de errores restablece el estado de envío y
permite reintentar. Los demás errores de red o servidor siguen el comportamiento
descrito para el formulario de contraseña.


### Renovación coordinada del transporte HTTP

**Identificador:** `DIA-FE-TEC-SES-001`. **Pregunta:** ¿cómo comparten dos peticiones
con 401 una renovación de sesión sin crear un refresh por componente?
**Fuente:** `src/public/js/services/axiosInstanceApi.js`. **Alcance:** ejemplo con dos
solicitudes cuya renovación coincide en el tiempo; no representa concurrencia de negocio.

## Participantes y trazabilidad

Los requests A y B son ejemplos concretos de archivos distintos. La variable
`refreshRequest` y el interceptor pertenecen al mismo archivo `axiosInstanceApi.js`:
comparten una sola línea de vida `Api`. Dos invocaciones concurrentes de ese archivo
no crean participantes adicionales. `PersonsRouter`, `UsersRouter` y `AuthRouter` identifican archivos diferentes de
rutas API. Sus handlers se desarrollan en las secuencias backend correspondientes;
los tres endpoints no comparten una línea de vida de servidor genérico.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `A` | boundary | [`personService.js`](../../../../../src/public/js/services/admin/personService.js) |
| `B` | boundary | [`userService.js`](../../../../../src/public/js/services/admin/userService.js) |
| `Api` | control | [`axiosInstanceApi.js`](../../../../../src/public/js/services/axiosInstanceApi.js) |
| `PersonsRouter` | boundary | [`personApiRoute.js`](../../../../../src/routes/api/admin/personApiRoute.js) |
| `UsersRouter` | boundary | [`userApiRoute.js`](../../../../../src/routes/api/admin/userApiRoute.js) |
| `AuthRouter` | boundary | [`authApiRoute.js`](../../../../../src/routes/api/authApiRoute.js) |

## Creación y espera de una renovación compartida

Se muestran dos consultas de archivos distintos. Los datos de cada request conservan
su endpoint; ambos callbacks del interceptor comparten la variable local `refreshRequest`.
El POST de renovación queda pendiente al final de esta figura.

```mermaid
sequenceDiagram
    autonumber
    participant A@{ "type": "boundary" } as Request personas
    participant B@{ "type": "boundary" } as Request usuarios
    participant Api@{ "type": "control" } as Cliente HTTP
    participant PersonsRouter@{ "type": "boundary" } as API personas
    participant UsersRouter@{ "type": "boundary" } as API usuarios
    participant AuthRouter@{ "type": "boundary" } as API sesión

    A->>Api: apiRequest({ method: 'get', url, params })
    Api->>PersonsRouter: GET /api/admin/persons
    PersonsRouter-->>Api: HTTP 401 de solicitud A
    Api->>Api: original._retry = true
    opt refreshRequest todavía es null
        Api->>AuthRouter: axios.post('/api/auth/refresh', {}, options)
        Note over Api,AuthRouter: refreshRequest guarda la promise
    end
    B->>Api: apiRequest({ method: 'get', url, params })
    Api->>UsersRouter: GET /api/admin/users
    UsersRouter-->>Api: HTTP 401 de solicitud B
    Api->>Api: original._retry = true
    Note over A,AuthRouter: A y B esperan await refreshRequest, sin otro POST de renovación
```

## Resolución de renovación y reintentos

Este nivel continúa con el resultado del POST pendiente. A y B se reintentan cuando
esa misma promise se resuelve; el orden dibujado es ilustrativo, no obliga a que A termine
antes que B. `options` en la llamada anterior es `{ withCredentials: true }`.

```mermaid
sequenceDiagram
    autonumber
    participant A@{ "type": "boundary" } as Request personas
    participant B@{ "type": "boundary" } as Request usuarios
    participant Api@{ "type": "control" } as Cliente HTTP
    participant PersonsRouter@{ "type": "boundary" } as API personas
    participant UsersRouter@{ "type": "boundary" } as API usuarios
    participant AuthRouter@{ "type": "boundary" } as API sesión

    Note over Api,AuthRouter: Resultado del POST pendiente del nivel anterior
    alt Renovación exitosa
        AuthRouter-->>Api: HTTP de renovación resuelta
        Api->>Api: refreshRequest = null en finally
        Api->>PersonsRouter: api(original A) — GET personas
        PersonsRouter-->>Api: HTTP de consulta A
        Api-->>A: apiRequest(): Promise[AxiosResponse]
        Api->>UsersRouter: api(original B) — GET usuarios
        UsersRouter-->>Api: HTTP de consulta B
        Api-->>B: apiRequest(): Promise[AxiosResponse]
    else Renovación fallida
        AuthRouter-->>Api: error de renovación
        Api->>Api: refreshRequest = null en finally
        Note over A,AuthRouter: window.location.href = '/' antes de propagar el rechazo
        Api-->>A: Promise.reject(refreshErr)
        Api-->>B: Promise.reject(refreshErr)
    end
```

La coordinación pertenece al transporte común, no al formulario ni al plugin Select2.
`_retry` impide otra renovación para la misma petición reintentada; `refreshRequest`
comparte sólo la renovación pendiente y se limpia en `finally`. El error de una nueva
respuesta 401 del reintento no abre indefinidamente más renovaciones.
