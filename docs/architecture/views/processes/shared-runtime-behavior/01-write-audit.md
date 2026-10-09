# 1. Auditoría de escrituras: comportamiento transversal

### Secuencia transversal de auditoría de escrituras

**Identificador:** `DIA-BE-SEQ-006`. **Requisito:** `RN-008`. La auditoría observa
la finalización de la respuesta y no participa en la transacción funcional. La secuencia
hace explícita esa persistencia *best effort*. El caso funcional se consulta en su propia
secuencia backend; no se agrupan ruta, controller y servicio en una línea de vida.

## Participantes y trazabilidad

Cada participante técnico corresponde a un archivo distinto. `Express`, el cliente y
la persistencia representan límites externos de esta colaboración. El objeto `res`,
su evento `finish` y la función `next` pertenecen al runtime Express.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Audit` | control | [`auditMiddleware.js`](../../../../../src/middleware/auditMiddleware.js) |
| `AuditService` | control | [`auditService.js`](../../../../../src/services/audit/auditService.js) |
| `Repository` | control | [`baseRepository.js`](../../../../../src/repository/baseRepository.js) |
| `Logger` | control | [`logger.js`](../../../../../src/utils/logger.js) |

## Registro del observador y finalización HTTP

El runtime ejecuta el caso funcional antes de emitir `finish`. Una respuesta elegible
inicia `persistWriteAudit` sin esperar su promesa; la siguiente figura amplía esa llamada.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Express@{ "type": "boundary" } as Runtime Express
    participant Audit@{ "type": "control" } as Auditoría HTTP
    participant AuditService@{ "type": "control" } as Servicio auditoría

    Client->>Express: POST/PUT/PATCH/DELETE bajo /api
    Express->>Audit: auditWrites(req, res, next)
    Audit->>AuditService: isAuditWriteRequest(req)
    AuditService-->>Audit: isAuditWriteRequest(): boolean
    break No es una escritura API
        Audit->>Express: next() sin observador
    end
    Audit->>Express: res.once('finish', callback)
    Audit->>Express: next()
    Note over Express,Audit: Caso funcional en su secuencia backend
    Express-->>Client: respuesta HTTP de la operación
    Express-)Audit: finish — callback del middleware
    alt statusCode >= 400 o actor ausente
        Note over Express,Audit: No persiste auditoría
    else Escritura exitosa con actor
        Audit-)AuditService: persistWriteAudit({ req, statusCode }) sin await
    end
```

## Persistencia best effort y fallo de auditoría

Esta colaboración amplía la llamada anterior. El archivo del servicio construye los
datos y utiliza `getDb()`, definido en el repository; los límites Prisma/PostgreSQL
representan el acceso persistente. El callback `catch` se define en el middleware,
por lo que el error vuelve a su línea de vida antes de invocar al logger.

```mermaid
sequenceDiagram
    autonumber
    participant Audit@{ "type": "control" } as Auditoría HTTP
    participant AuditService@{ "type": "control" } as Servicio auditoría
    participant Repository@{ "type": "control" } as Repository base
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Logger@{ "type": "control" } as Logger

    Audit-)AuditService: persistWriteAudit({ req, statusCode }) sin await
    AuditService->>Repository: getDb() — valor por defecto de db
    Repository-->>AuditService: getDb(): PrismaClient
    AuditService->>AuditService: buildAuditData(req, statusCode)
    AuditService->>Prisma: db.criticalWriteAudit.create({ data })
    alt Persistencia resuelta
        Prisma-->>AuditService: create(): Promise[CriticalWriteAudit]
    else Persistencia rechazada
        Prisma-->>AuditService: error de persistencia
        AuditService-->>Audit: promesa rechazada — callback catch(err)
        Audit->>Logger: logger.error({ err, method, path }, message)
        Note over Audit,Logger: No revierte la operación ya respondida
    end
```
