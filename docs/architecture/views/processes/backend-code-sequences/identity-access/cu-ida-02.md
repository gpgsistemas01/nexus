<a id="cu-ida-02"></a>
# `CU-IDA-02` — Crear persona

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`personApiRoute.js`](../../../../../../src/routes/api/admin/personApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`personController.js`](../../../../../../src/controllers/api/admin/personController.js) |
| `PersonDto` | control | [`personDTO.js`](../../../../../../src/dtos/personDTO.js) |
| `Domain` | control | [`personService.js`](../../../../../../src/services/admin/person/personService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`personValidations.js`](../../../../../../src/validators/forms/personValidations.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant PersonDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/admin/persons
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: personValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.PERSONS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerPerson(req, res)
    activate Controller
    Controller->>PersonDto: createPersonDtoForRegister(req.body)
    activate PersonDto
    PersonDto-->>Controller: createPersonDtoForRegister(): Object (personDto)
    deactivate PersonDto
    Controller->>Domain: personService.createPerson({ personDto }) valida y crea persona/asignaciones
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: personService.createPerson(): Promise[Person]
        Controller-->>Client: HTTP 201 { datos y código de operación }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
