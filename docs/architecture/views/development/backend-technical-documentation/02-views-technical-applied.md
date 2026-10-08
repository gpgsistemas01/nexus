# 2. Diagramas técnicos complementarios

### Relación con la colección canónica

Los 85 recorridos `DIA-BE-CU-*` de `backend-code-sequences/index.md` forman la colección
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
| `DIA-BE-TEC-EST-AUT-01` | ¿Qué condiciones permiten superar autorización? | Secuencias autenticadas; distingue token, cuenta activa y permiso efectivo. |
| `DIA-BE-TEC-EST-CU-ENT-04` | ¿Cuál es el ciclo técnico de una corrección? | `DIA-BE-CU-ENT-04`, su transacción y la publicación posterior. |

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
    Route-->>Response: completar operación y status
    Response-->>Audit: finish
    alt status >= 400 o actor ausente
        Audit-->>Audit: no persistir auditoría
    else escritura exitosa con actor
        Audit->>AuditService: request y status para construir datos saneados
        AuditService->>Prisma: create audit trail
        alt falla la persistencia de auditoría
            AuditService-->>Logger: registrar error sin revertir operación
        end
    end
```

### Estados técnicos complementarios

Estos diagramas permanecen aquí porque añaden ciclos técnicos que no repite la colección
de secuencias por caso.

**Estado técnico complementario:** `DIA-BE-TEC-EST-AUT-01`. Una máquina de estados es
la representación adecuada porque la pregunta es si la cuenta conserva las condiciones para
atravesar el middleware entre peticiones; una secuencia explica el orden de una petición,
pero no expresa con igual claridad la pérdida de elegibilidad. `getLoggedUser(userId)`
vuelve a consultar estas condiciones en `authorizeUserApi` y `authorizeUserWeb`.

```mermaid
stateDiagram-v2
    [*] --> TokenValido: validar token [firma y vigencia válidas]
    TokenValido --> Invalido: consultar usuario [inexistente o inactivo]
    TokenValido --> Invalido: consultar persona [inactiva]
    TokenValido --> Invalido: consultar acceso [sin asignaciones]
    TokenValido --> UsuarioActivo: consultar identidad [usuario activo y persona activa o ausente]
    UsuarioActivo --> Autorizado: autorizar [asignación permitida]
    UsuarioActivo --> Prohibido: autorizar [permiso insuficiente]
    Autorizado --> MiddlewareSuperado: continuar / establecer req.user y ejecutar next()
    Invalido --> Rechazado401: rechazar / responder 401 INVALID_AUTH
    Prohibido --> Rechazado403: rechazar / responder 403 FORBIDDEN
    MiddlewareSuperado --> [*]
    Rechazado401 --> [*]
    Rechazado403 --> [*]
```

El estado **Usuario activo** exige `User.isActive`, una `Person.isActive` cuando la cuenta
es humana y al menos una asignación vigente. El JWT sólo conduce a **Token válido**; no
evita que una desactivación o la pérdida de asignaciones bloquee la siguiente petición.

**Estado técnico complementario:** `DIA-BE-TEC-EST-CU-ENT-04`. Muestra el ciclo de la
transacción de corrección; los estados funcionales permanecen en requisitos.

```mermaid
stateDiagram-v2
    [*] --> Recibida: correctGoodsReceiptDetail
    Recibida --> Validada: validar [detalle y DTO válidos]
    Recibida --> Rechazada: validar [error de dominio] / rechazar
    Validada --> TransaccionAbierta: correctGoodsReceiptDetailLine
    TransaccionAbierta --> Rollback: persistir [fallo de escritura] / revertir transacción
    TransaccionAbierta --> Commit: persistir [escrituras completas] / confirmar transacción
    Commit --> EventoPublicado: confirmar / emitir emitInventoryUpdated()
    Rollback --> Respondida
    EventoPublicado --> Respondida
    Rechazada --> Respondida
    Respondida --> [*]
```
