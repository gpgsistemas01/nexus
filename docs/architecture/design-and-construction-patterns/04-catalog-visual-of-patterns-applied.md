# 4. Catálogo visual de patrones aplicados

Estas vistas representan únicamente patrones con implementación y consumidores
verificables. En las vistas estructurales, una caja nombra el patrón o estrategia, el
nodo siguiente identifica el símbolo o carpeta que lo implementa y el último nodo
muestra consumidores reales. Las flechas de esas vistas no significan herencia salvo
que se indique expresamente.
Los diagramas estructurales localizan implementaciones y consumidores; las secuencias
de frontera y dinámica muestran orden, alternativas y límites temporales. En estas
últimas, los participantes nombran el archivo o símbolo ejecutable y los mensajes
conservan las llamadas y datos que pueden seguirse en el código. El código del patrón
en la línea **Patrones** sirve sólo como índice: no sustituye esta traza de construcción.
Así el catálogo representa tanto la forma del patrón como su colaboración sin cargar
los diagramas de cada caso con infraestructura repetida.

### Estructura por dominio, capas y fronteras

**Identificador:** `DIA-PAT-EST-001`. **Pregunta:** ¿cómo se separan dominio,
transporte y reglas sin declarar un MVC estricto?

```mermaid
flowchart LR
    modular["Monolito modular<br/>admin · sales · warehouse"] --> routes["routes / controllers"]
    routes --> dto["DTO funcional<br/>src/dtos"]
    dto --> services["services de dominio"]
    services --> db["getDb / Prisma"]
    browser["Capas del navegador"] --> clientService["public/js/services"]
    clientService --> application["public/js/application"]
    application --> pages["public/js/pages y EJS"]
```

### Pipeline, DTO y políticas declarativas

**Identificador:** `DIA-PAT-FRO-001`. **Pregunta:** ¿qué mecanismos reutiliza una ruta
antes de entregar datos normalizados al caso de uso?

```mermaid
sequenceDiagram
    actor Client as Cliente HTTP
    participant Route@{ "type": "boundary" } as routes/api/*ApiRoute.js
    participant Auth@{ "type": "control" } as middleware/authMiddleware.js
    participant Validation@{ "type": "control" } as validators/forms/* + validatorMiddleware.validate
    participant Controller@{ "type": "control" } as controllers/api/*Controller.js
    participant Dto as <u>resourceDto: Object</u><br/>dtos/*DTO.js
    participant Service as services/*Service.js

    Client->>Route: enviar petición
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    alt token inválido o ausente
        Auth-->>Client: responder rechazo de autenticación
    else sesión autenticada
        Auth->>Validation: ejecutar validaciones declaradas por la ruta
        Validation->>Validation: validate(req, res, next) consolida errores
        alt entrada inválida
            Validation-->>Client: responder error de validación
        else entrada aceptada
            Validation->>Auth: authorizeUserApi
            Auth->>Auth: evaluar PERMISSIONS y AUTHORIZATION_POLICIES
            alt permiso denegado
                Auth-->>Client: responder rechazo de autorización
            else permiso concedido
                Auth->>Controller: controller(req, res) con req.user
                opt el endpoint acepta un DTO
                    Controller->>Dto: create*Dto(req.body)
                    Dto-->>Controller: resourceDto normalizado
                end
                Controller->>Service: invocar función importada con resourceDto, params y userId
                Service-->>Controller: devolver resultado o error de dominio
                Controller-->>Client: emitir respuesta HTTP
            end
        end
    end
```

La construcción se comprueba desde la declaración ordenada de middleware en
[`src/routes/api`](../../../src/routes/api), las funciones de
[`authMiddleware.js`](../../../src/middleware/authMiddleware.js) y
[`validatorMiddleware.js`](../../../src/middleware/validatorMiddleware.js), y la adaptación
de entrada en [`src/controllers/api`](../../../src/controllers/api) y
[`src/dtos`](../../../src/dtos). Las etiquetas genéricas `*` agrupan archivos equivalentes;
el diagrama de cada caso las reemplaza por su ruta, controller, DTO y servicio concretos.
Las figuras `boundary` y `control`, el actor y la línea de vida del objeto son parte de
la lectura visual; los textos de la cabecera no funcionan como estereotipos sustitutos.
La validación mostrada es la autoritativa del backend. Una validación frontend se traza
por separado como auto-mensaje del formulario o módulo UI y como alternativa previa al
request, sin omitir que el servidor vuelve a validar la entrada.

### Factories y composición sobre herencia

**Identificador:** `DIA-PAT-CON-001`. **Pregunta:** ¿qué se configura para crear una
variante sin duplicar el flujo común?

```mermaid
sequenceDiagram
    participant Module as application/warehouse/materials/materials.js
    participant Factory as application/createCrudApplication.js
    participant Mutation as createApplicationMutation
    participant Request as services/warehouse/materialService.js
    participant Page as pages/warehouse/materials/materialForm.js

    Module->>Factory: createCrudApplication({ requests, dataKeys, additionalMutations })
    Factory->>Factory: createApplicationList(requests.getAll)
    loop register, edit, editStock y remove
        Factory->>Mutation: createMutation(operation)
        Mutation-->>Factory: closure que adapta formData, id y opciones
    end
    Factory-->>Module: Object.freeze({ getAll, register, edit, editStock, remove })
    Module->>Module: exportar referencias con nombres de dominio
    Page->>Module: registerMaterial({ formData, creationContext })
    Module->>Mutation: materialApplication.register(...)
    Mutation->>Request: registerMaterialRequest({ data })
    Request-->>Mutation: response
    Mutation-->>Page: createSuccessResponseFromRequest({ response, dataKey })
```

Esta secuencia muestra la construcción en dos momentos que el resumen del patrón no
expresa: al evaluar el módulo se inyectan requests y se crean *closures* inmutables; al
interactuar la página se usa una referencia de dominio que conserva esa configuración.
El ejemplo se puede recorrer en
[`createCrudApplication.js`](../../../src/public/js/application/createCrudApplication.js),
[`materials.js`](../../../src/public/js/application/warehouse/materials/materials.js),
[`materialService.js`](../../../src/public/js/services/warehouse/materialService.js) y
[`materialForm.js`](../../../src/public/js/pages/warehouse/materials/materialForm.js). Los
demás consumidores reutilizan la misma construcción con su propia tabla `requests`.

### Transacción, eventos y auditoría

**Identificador:** `DIA-PAT-DIN-001`. **Pregunta:** ¿cómo colaboran consistencia
atómica, publicación y trazabilidad sin confundir sus límites?

```mermaid
sequenceDiagram
    participant Controller as controllers/api/*Controller.js
    participant Service as services/*Service.js (Transaction Script)
    participant Prisma as lib/prisma.js $transaction
    participant Writes as services auxiliares + repository/getDb(tx)
    participant Events as utils/socketUtils.emitInventoryUpdated
    participant Audit as middleware/auditMiddleware.auditWrites

    Controller->>Service: función importada({ DTO, id, userId })
    Service->>Prisma: prisma.$transaction(async tx => ...)
    Prisma->>Writes: helper({ ..., tx }) usa getDb(tx)
    Writes->>Writes: escribir documento, detalle, existencia y movimiento
    alt falla una escritura
        Writes-->>Prisma: propagar error
        Prisma-->>Service: rollback
        Service-->>Controller: propagar error sin publicar
    else todas las escrituras terminan
        Writes-->>Prisma: resultado
        Prisma-->>Service: commit
        Service-->>Controller: devolver resultado confirmado
        opt mutación de inventario
            Controller->>Events: publicar actualización no durable
        end
        Controller-->>Audit: finalizar respuesta HTTP exitosa
        Audit->>Audit: sanitizar y persistir CriticalWriteAudit best effort
    end
```

La traza parte del controller propietario y permite distinguir código ejecutado dentro
del callback de Prisma de efectos posteriores. `getDb(tx)` está implementado en
[`baseRepository.js`](../../../src/repository/baseRepository.js), el publicador en
[`socketUtils.js`](../../../src/utils/socketUtils.js) y la auditoría transversal en
[`auditMiddleware.js`](../../../src/middleware/auditMiddleware.js). Los diagramas técnicos
de cada mutación sustituyen los comodines por los servicios y escrituras exactos.

### Test harness configurable

**Identificador:** `DIA-PAT-TST-001`. **Pregunta:** ¿cómo reutilizan las pruebas el
montaje HTTP sin ocultar las rutas y efectos propios de cada contexto?

```mermaid
flowchart LR
    harness["createControllerTestApp"] -. configuración .-> register["registerRoutes del contexto"]
    register --> app["Express mínimo + JSON"]
    app --> unit["Pruebas unitarias de borde"]
    app --> integration["Integraciones de cliente, proveedor,<br/>catálogos y salida de merma"]
    integration --> evidence["Router · permiso · persistencia · rollback"]
```

Cada diagrama específico declara una línea **Patrones** con los códigos resueltos por el
índice rápido de frontend o backend. Así se identifica la solución aplicada sin repetir
su explicación ni añadir vistas intermedias en los 72 casos de cada perspectiva. La
cadena de lectura es **patrón aplicado → recorrido concreto del caso**: una
refactorización cambia primero este catálogo y sus implementaciones, y los códigos
permiten localizar después todos los casos afectados. `DIA-PAT-TST-001` representa
por separado la reutilización del montaje de pruebas, porque no participa en el flujo
de ejecución de un caso en producción.
