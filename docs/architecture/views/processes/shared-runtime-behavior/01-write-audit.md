# 1. Auditoría de escrituras: comportamiento transversal

La secuencia es propietaria del momento de observación/persistencia compartido por
las escrituras API. Las dependencias de sus archivos están en la referencia técnica
del backend; aquí se describe el comportamiento asíncrono.

### Secuencia transversal de auditoría de escrituras

**Identificador:** `DIA-BE-SEQ-006`. **Requisito:** `RN-008`. La auditoría observa la
respuesta HTTP y no forma parte de la transacción funcional actual; este diagrama hace
explícita esa garantía *best effort*.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Cliente HTTP autenticado
    participant Audit as auditWrites
    participant Route as Ruta/controller/servicio
    participant Response as Respuesta Express
    participant AuditService as persistWriteAudit
    participant Prisma as CriticalWriteAudit
    participant Logger as logger

    Browser->>Audit: POST/PUT/PATCH/DELETE bajo /api
    Audit->>Response: registrar listener once(finish)
    Audit->>Route: next()
    Route->>Response: completar operación y emitir respuesta HTTP
    Response-->>Browser: respuesta de la operación
    Response-->>Audit: finish
    alt status >= 400 o actor ausente
        Note over Audit: No se invoca persistWriteAudit
    else escritura exitosa con actor
        Audit-)AuditService: persistWriteAudit({ req, statusCode }) sin esperar la promesa
        AuditService->>Prisma: create audit trail
        opt falla la persistencia de auditoría
            AuditService-->>Audit: promesa rechazada
            Audit->>Logger: logger.error(err) sin revertir operación
        end
    end
```

**Fuente:** `src/middleware/auditMiddleware.js` y `src/services/audit/auditService.js`.
