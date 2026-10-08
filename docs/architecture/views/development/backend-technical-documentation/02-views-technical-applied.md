# 2. Diagramas técnicos complementarios

### Relación con la colección canónica

Los 92 recorridos `DIA-BE-CU-*` de `backend-code-sequences/index.md` forman la colección
canónica por caso y son propietarios del orden ruta → controller → servicio →
persistencia o efecto. Este documento conserva únicamente diagramas que contestan una
pregunta adicional. Un diagrama complementario no reemplaza la secuencia enlazada, no
amplía su cobertura y no obliga a copiarla.

```mermaid
flowchart LR
    case["CU-* y requisito"] --> canonical["DIA-BE-CU-*<br/>recorrido canónico"]
    canonical -. decisión o ciclo adicional .-> activity["Actividad o estado<br/>complementario"]
    canonical --> code["Ruta · controller · servicio · datos"]
    activity -. no sustituye .-> canonical
```

| Diagrama conservado | Pregunta adicional | Complementa |
| --- | --- | --- |
| `DIA-BE-TEC-EST-RUT-01` · registro de rutas | ¿Cómo se monta la superficie Express completa? | `src/app.js`, `API_ROUTES` y el mapa generado; no representa un `CU-*`. |
| `DIA-BE-ACT-002` · `CU-ENT-05` | ¿Qué decisiones provocan rechazo, rollback o cancelación? | `DIA-BE-CU-ENT-05` y la máquina normativa si cambia un estado de negocio. |
| `DIA-BE-ACT-001` · `CU-SAL-05` | ¿Cómo se separan actualización, surtimiento y errores? | `DIA-BE-CU-SAL-05` y los estados normativos de salidas. |
| `DIA-BE-SEQ-006` · `RN-008` | ¿Cuándo ocurre la auditoría y puede revertir la operación? | Escrituras API observadas mediante `finish`; documenta la garantía *best effort*. |
| `DIA-BE-ACT-AUT-01` | ¿Qué condiciones permiten autorizar una petición? | Secuencias autenticadas; distingue token, cuenta activa y permiso efectivo. |
| `DIA-BE-TEC-EST-CU-ENT-04` | ¿Cuál es el ciclo técnico de una corrección? | `DIA-BE-CU-ENT-04`, su transacción; distingue los efectos posteriores al commit. |

Las antiguas secuencias selectivas de autenticación, ajustes, entrada, corrección,
surtimientos y devoluciones no se mantienen aquí: respondían la misma pregunta que sus
`DIA-BE-CU-*`. Su detalle quedó consolidado en la colección canónica. Así, una operación
compleja puede tener más de un **diagrama**, pero nunca dos fuentes para el mismo recorrido.

### Registro de rutas

**Identificador:** `DIA-BE-TEC-EST-RUT-01`. **Pregunta:** ¿cómo se registra la
superficie HTTP y dónde terminan las peticiones que no encuentran una ruta?

```mermaid
flowchart LR
    process["Node.js<br/>src/app.js"] --> app["app<br/>Express"]
    app --> web["registerWebRoutes(app)"]
    app --> api["registerApiRoutes(app, { apiPrefix })"]
    api --> registry["API_ROUTES"]
    registry --> auth["/api/auth"]
    registry --> sales["/api/sales/*"]
    registry --> warehouse["/api/warehouse/*"]
    registry --> admin["/api/admin/*"]
    app --> notFound["404 API o HTML"]
    app --> errors["Middleware final de error"]
```

Se revisa si cambia el orden de montaje en `src/app.js`, el contrato de
`registerApiRoutes` o las áreas de `API_ROUTES`.

### Actividad de cancelación de un detalle de entrada

**Identificador:** `DIA-BE-ACT-002`. **Caso:** `CU-ENT-05`. Este diagrama enfatiza las
decisiones exclusivas de cancelación y la ausencia de una segunda identidad corregida.

La figura usa la [convención de actividades](../../processes/index.md#notación-de-actividades)
como aproximación a UML mediante Mermaid.

```mermaid
flowchart TB
    initial@{ shape: f-circ } --> request("Recibir cancelGoodsReceiptDetailLine")
    request --> transaction("Abrir $transaction")
    transaction --> find{"¿Existen entrada y detalle?"}
    find -->|"[no]"| notFound("Propagar GoodsReceiptNotFound")
    find -->|"[sí]"| active{"¿El detalle sigue activo?"}
    active -->|"[no]"| alreadyCanceled("Propagar GoodsReceiptDetailAlreadyCanceled")
    active -->|"[sí]"| reason{"¿Existe motivo de cancelación?"}
    reason -->|"[no]"| reasonError("Propagar GoodsReceiptDetailChangeReasonNotFound")
    reason -->|"[sí]"| reverse{"¿Puede revertirse la existencia recibida?"}
    reverse -->|"[no]"| stockError("Propagar conflicto de existencia")
    reverse -->|"[sí]"| movement("Crear movimiento inverso y actualizar stock")
    movement --> cancel("Marcar detalle cancelado y recalcular totales")
    cancel --> history("Guardar cambio, motivo y actor")
    history --> commit("Confirmar la transacción")
    commit --> costs("Recalcular costos fuera de la transacción")
    costs --> result("Devolver entrada actualizada")
    result --> final@{ shape: fr-circ }
    notFound --> rejected{" "}
    alreadyCanceled --> rejected
    reasonError --> rejected
    stockError --> rejected
    rejected --> rollback("Revertir la transacción y propagar el error")
    rollback --> final
```

### Actividad de decisión y surtimiento de materiales

**Identificador:** `DIA-BE-ACT-001`. **Caso:** `CU-SAL-05`. Esta actividad complementa
`DIA-BE-CU-SAL-05` exclusivamente para `GoodsIssue`: hace visibles sus errores y sus
decisiones de estado sin presentarlas como equivalentes a las de `WasteIssue`.

La figura usa la [convención de actividades](../../processes/index.md#notación-de-actividades)
como aproximación a UML mediante Mermaid.

```mermaid
flowchart TB
    initial@{ shape: f-circ } --> load("Cargar salida y detalles solicitados")
    load --> exists{"¿Existe la salida?"}
    exists -->|"[no]"| notFound("Propagar GoodsIssueNotFound")
    exists -->|"[sí]"| editable{"¿Estado Pendiente o Surtido parcial?"}
    editable -->|"[no]"| conflict("Propagar GoodsIssueNotPendingConflict")
    editable -->|"[sí]"| classify("Separar actualizaciones y solicitudes de surtimiento")
    classify --> transaction("Abrir $transaction")
    transaction --> supply{"¿Hay cantidades por surtir?"}
    supply -->|"[sí]"| movement("Aplicar movimiento de inventario ISSUE")
    supply -->|"[no]"| mergeUpdate{" "}
    movement --> mergeUpdate
    mergeUpdate --> update("Actualizar detalles")
    update --> refresh("Releer detalles")
    refresh --> headerStatus("Resolver cumplimiento del encabezado")
    headerStatus --> result("Actualizar encabezado y confirmar transacción")
    result --> final@{ shape: fr-circ }
    notFound --> final
    conflict --> final
```

La actividad resume las decisiones de dominio, sin desplegar cada fallo técnico de
lectura o escritura. Un fallo dentro de la transacción provoca rollback y termina la
operación; su propagación se detalla en la secuencia canónica. El recálculo de costos de
la cancelación ocurre después del commit y no puede revertir esa transacción.

La actividad complementa la secuencia porque hace visibles errores y bifurcaciones. La
evidencia del adaptador está en
[`goodsIssueControllerTest.js`](../../../../../tests/unit/controllers/api/warehouse/goodsIssueControllerTest.js);
la cobertura y brechas de servicios permanecen en el [plan de pruebas](../../../../testing/test-plan.md).
La aplicación por caso y su evidencia se consulta en la
[vista de componentes](../../logical/01-components-and-reuse.md). El identificador,
propósito y fuente de verdad de cada gráfico se mantienen junto al diagrama, sin otro
inventario manual.

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

Los siguientes diagramas explican las decisiones de acceso y el ciclo de una transacción,
como complemento de las secuencias por caso de uso.

### Decisiones de autenticación y autorización API

**Identificador:** `DIA-BE-ACT-AUT-01`. Representa el flujo de una petición API
protegida, no estados persistidos de la cuenta. `verifyApiTokenRequired` verifica el
JWT; `authorizeUserApi` consulta de nuevo la identidad y sus asignaciones y evalúa la
política del recurso. Una petición nueva vuelve a realizar estas comprobaciones.

La figura usa la [convención de actividades](../../processes/index.md#notación-de-actividades)
como aproximación a UML mediante Mermaid. La validación del payload, cuando la ruta la
exige, ocurre entre ambos componentes de middleware y puede terminar con HTTP 400; aquí se detalla
únicamente la decisión de acceso.

```mermaid
flowchart TB
    initial@{ shape: f-circ } --> token("verifyApiTokenRequired: leer y verificar accessToken")
    token --> validToken{"¿Token presente, firmado y vigente?"}
    validToken -->|"[no]"| merge401{" "}
    validToken -->|"[sí]"| identity("authorizeUserApi: getLoggedUser(req.userId)")
    identity --> validIdentity{"¿Usuario activo, persona activa o ausente y asignaciones?"}
    validIdentity -->|"[no]"| merge401
    validIdentity -->|"[sí]"| permission{"¿Alguna asignación cumple la política?"}
    permission -->|"[no]"| forbidden("Responder HTTP 403 FORBIDDEN")
    permission -->|"[sí]"| allowed("Establecer req.user y ejecutar next()")
    merge401 --> unauthorized("Responder HTTP 401 INVALID_AUTH")
    unauthorized --> mergeFinal{" "}
    forbidden --> mergeFinal
    allowed --> mergeFinal
    mergeFinal --> final@{ shape: fr-circ }
```

En web, `verifyCookiesAuthTokenRequired` redirige a `/revocar-sesion` y
`authorizeUserWeb` redirige a `/error/404`; los HTTP 401/403 de esta figura corresponden
al procesamiento de peticiones API. El JWT no evita que una desactivación o la pérdida de asignaciones
bloquee la siguiente petición.

### Estados de la transacción de corrección

**Estado técnico complementario:** `DIA-BE-TEC-EST-CU-ENT-04`. El objeto modelado es
la transacción de `correctGoodsReceiptDetailLine`, no la compra ni la respuesta HTTP.
La búsqueda del detalle, las comprobaciones de dominio y las escrituras ocurren dentro
del callback de `$transaction`; un rechazo en cualquiera de ellas revierte la transacción.

```mermaid
stateDiagram-v2
    state "Transacción abierta" as Abierta
    state "Confirmada (commit)" as Confirmada
    state "Revertida (rollback)" as Revertida
    [*] --> Abierta: invocar $transaction(callback)
    Abierta --> Revertida: callback rechazado / rollback
    Abierta --> Confirmada: callback resuelto / commit
    Revertida --> [*]: propagar error
    Confirmada --> [*]: devolver resultado
```

El recálculo de costos ocurre después del commit. Si falla, el servicio propaga un
error sin revertir lo confirmado; el controlador emite la actualización de inventario sólo cuando el servicio termina
con éxito. Los estados funcionales de la compra permanecen en requisitos. La secuencia
`DIA-BE-CU-ENT-04` muestra el recálculo posterior, el retorno al controller y
`emitInventoryUpdated`; esas acciones no son estados de la transacción.
