# 4. Catálogo visual de patrones aplicados

El catálogo conecta las responsabilidades compartidas con sus implementaciones y
consumidores. Las figuras estructurales localizan dependencias y configuración; las
secuencias explican construcción, controles y límites temporales. Cada mecanismo tiene
un contrato y variantes que permanecen en el recurso. Los símbolos y archivos permiten
contrastar el dibujo con código y pruebas, sin atribuirle cobertura adicional.

Los capítulos de detalle completan [políticas y adaptación de datos](07-dto-functional-and-policies-declarative.md),
[publicador y suscriptores](10-publication-of-events-of-inventory.md),
[ownership visual](12-composition-and-ownership-of-components-visual.md) y
[refactorización](16-refactoring-and-extension.md). Los códigos **Patrones** de los casos
son enlaces a estas colaboraciones; no sustituyen su evidencia de aplicación.

### Estructura por dominio, capas y fronteras

**Identificador:** `DIA-PAT-EST-001`. **Pregunta:** ¿dónde se materializa la separación
por capa y qué soluciones compartidas consumen los recursos? **Alcance:** dependencias
de módulos ES; las flechas apuntan del consumidor a la pieza utilizada.

```mermaid
flowchart TB
    subgraph resources["Módulos propietarios por dominio"]
        admin["admin<br/>usuarios · personas · catálogos"]
        sales["sales<br/>clientes"]
        warehouse["warehouse<br/>inventario · compras · salidas"]
    end
    admin --> transport["routes + controllers<br/>frontera HTTP y respuesta"]
    sales --> transport
    warehouse --> transport
    transport --> rules["services + dtos + validators<br/>reglas y contratos por recurso"]
    rules --> persistence["repository/baseRepository.getDb(tx)<br/>lib/prisma.js"]
    pages["public/js/pages<br/>pantalla del recurso"] --> application["public/js/application<br/>operaciones y configuración de factories"]
    application --> requests["public/js/services<br/>requests HTTP"]
    pages --> visual["public/js/ui + plugins<br/>composición visual compartida"]
    requests -->|HTTP| transport
```

Las cajas de dominio localizan familias repartidas entre capas; no son clases ni
servicios desplegables. El [corte de materiales](../code-diagrams/04-view-structural-domains-and-collaborations.md)
permite seguir archivos concretos. La referencia backend explica el contrato de cada
capacidad y la frontend explica qué se configura y qué estado conserva la pantalla.

### Pipeline, DTO y políticas declarativas

**Identificador:** `DIA-PAT-FRO-001`. **Pregunta:** ¿cómo aplica una escritura de
materiales el pipeline y el DTO antes de ejecutar reglas? **Fuente:**
`materialApiRoute.js`, `materialController.js`, `materialDTO.js` y `authMiddleware.js`.
**Alcance:** alta de material; no impone su orden a todos los routers.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Cliente HTTP
    participant Route@{ "type": "boundary" } as materialApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Validation@{ "type": "control" } as materialValidation + validate
    participant Controller@{ "type": "control" } as materialController.js
    participant Dto@{ "type": "entity" } as materialDTO.js
    participant Service@{ "type": "control" } as materialService.js

    Client->>Route: POST /api/warehouse/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    alt token ausente o inválido
        Auth-->>Client: 401 INVALID_AUTH
    else token aceptado
        Auth->>Validation: materialValidation[] y validate(req, res, next)
        alt entrada inválida
            Validation-->>Client: respuesta de validación sin invocar el servicio
        else entrada aceptada
            Validation->>Auth: authorizeUserApi(MATERIALS_WRITE)
            Auth->>Auth: cargar usuario y comprobar política vigente
            alt usuario inválido o permiso insuficiente
                Auth-->>Client: 401 INVALID_AUTH o 403 FORBIDDEN
            else acceso permitido
                Auth->>Controller: registerMaterial(req, res)
                Controller->>Dto: createMaterialDtoForRegister(req.body)
                Dto-->>Controller: campos normalizados
                Controller->>Controller: materialDto = sanitizeEmptyStrings(materialDto)
                Controller->>Service: createMaterial({ materialDto, userId })
                Service-->>Controller: material creado o error de dominio
                Controller-->>Client: respuesta del controller
            end
        end
    end
```

El DTO selecciona y normaliza campos; la autorización y las reglas conservan sus
propietarios. El contrato exacto del servicio se comprueba en el controller: la secuencia
es una colaboración del alta, no una firma común para todos los recursos.

| Variante real | Orden declarado | Fuente |
| --- | --- | --- |
| Alta/edición de material | Token → validators → validate → autorización → controller. | `src/routes/api/warehouse/materialApiRoute.js`. |
| Consulta de materiales | Token → autorización → controller, sin validator de formulario. | El mismo router, `GET /`. |
| Catálogos administrables | `router.use` instala token y autorización; luego la operación valida y delega. | `src/routes/api/admin/catalogApiRoute.js`. |

La construcción de permisos se explica en
[políticas declarativas](07-dto-functional-and-policies-declarative.md#aplicación-de-políticas-declarativas).
El middleware global de auditoría se monta antes de los routers y observa la respuesta;
no constituye otra etapa local entre DTO y servicio.

### Factories y composición sobre herencia

**Identificador:** `DIA-PAT-CON-001`. **Pregunta:** ¿qué se configura para crear una
variante sin duplicar el flujo común?

```mermaid
sequenceDiagram
    autonumber
    participant Module as application/warehouse/materials/materials.js
    participant Factory as application/createCrudApplication.js
    participant Mutation as createApplicationMutation
    participant Request@{ "type": "control" } as services/warehouse/materialService.js
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
    Mutation-->>Module: createSuccessResponseFromRequest({ response, dataKey })
    Module-->>Page: resultado de registerMaterial()
```

Esta secuencia muestra la construcción en dos momentos que el resumen del patrón no
expresa: al evaluar el módulo se inyectan requests y se crean *closures* inmutables; al
interactuar la página se usa una referencia de dominio que conserva esa configuración.
El ejemplo se puede recorrer en
[`createCrudApplication.js`](../../../../../src/public/js/application/createCrudApplication.js),
[`materials.js`](../../../../../src/public/js/application/warehouse/materials/materials.js),
[`materialService.js`](../../../../../src/public/js/services/warehouse/materialService.js) y
[`materialForm.js`](../../../../../src/public/js/pages/warehouse/materials/materialForm.js). Los
demás consumidores reutilizan la misma construcción con su propia tabla `requests`.

### Transacción, eventos y auditoría

**Identificador:** `DIA-PAT-DIN-001`. **Pregunta:** ¿cómo colaboran consistencia
atómica, publicación y trazabilidad sin confundir sus límites?

```mermaid
sequenceDiagram
    autonumber
    participant Controller as controllers/api/*Controller.js
    participant Service@{ "type": "control" } as services/*Service.js (Transaction Script)
    participant Prisma@{ "type": "database" } as lib/prisma.js $transaction
    participant Writes as services auxiliares + repository/getDb(tx)
    participant Events as utils/socketUtils.emitInventoryUpdated
    participant Response as Respuesta Express
    participant Audit as middleware/auditMiddleware.auditWrites
    participant AuditService as services/audit/auditService.persistWriteAudit

    Controller->>Service: función importada({ DTO, id, userId })
    Service->>Prisma: prisma.$transaction(async tx => ...)
    Note over Service,Prisma: El callback conserva el mismo tx
    Service->>Writes: helper({ ..., tx }) usa getDb(tx)
    Writes->>Writes: escribir documento, detalle, existencia y movimiento
    alt falla una escritura
        Writes-->>Service: propagar error del callback
        Prisma-->>Service: rollback
        Service-->>Controller: propagar error sin publicar
    else todas las escrituras terminan
        Writes-->>Service: resultado del callback
        Prisma-->>Service: commit
        Service-->>Controller: devolver resultado confirmado
        opt mutación de inventario
            Controller->>Events: publicar actualización no durable
        end
        Controller->>Response: emitir respuesta HTTP exitosa
        Response-->>Audit: evento finish
        Audit-)AuditService: persistWriteAudit() sin esperar su resultado
    end
```

La traza parte del controller propietario y permite distinguir código ejecutado dentro
del callback de Prisma de efectos posteriores. `getDb(tx)` está implementado en
[`baseRepository.js`](../../../../../src/repository/baseRepository.js), el publicador en
[`socketUtils.js`](../../../../../src/utils/socketUtils.js) y la auditoría transversal en
[`auditMiddleware.js`](../../../../../src/middleware/auditMiddleware.js). Los diagramas técnicos
de cada mutación sustituyen los comodines por los servicios y escrituras exactos.

### Test harness configurable

**Identificador:** `DIA-PAT-TST-001`. **Pregunta:** ¿cómo se reutiliza el montaje HTTP
sin ocultar las rutas y efectos del contexto? **Fuente:**
`tests/helpers/controllerTestHarness.js` y sus tests consumidores.

```mermaid
flowchart TB
    client["clientControllerDbTest.js<br/>configura registerRoutes"] --> harness["createControllerTestApp<br/>Express + JSON + errores"]
    supplier["supplierControllerDbTest.js<br/>configura registerRoutes"] --> harness
    waste["wasteIssueControllerDbTest.js<br/>configura registerRoutes"] --> harness
    harness --> app["App del contexto<br/>rutas registradas por el callback"]
    app --> requests["Supertest<br/>requests y aserciones del caso"]
    requests --> checks["Respuesta HTTP + estado Prisma<br/>según cada prueba"]
```

Los consumidores nombrados están en `tests/integration/controllers`. El helper sólo
construye el entorno y traduce errores; permisos, persistencia y rollback deben
comprobarse en las pruebas que corresponden, no se deducen del montaje Express.
Los códigos **Patrones** de las secuencias enlazan estas colaboraciones canónicas;
la presencia de un código no sustituye la evidencia del consumidor ni de sus pruebas.
