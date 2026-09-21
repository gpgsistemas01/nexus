# 19. Derivación de la cancelación del encabezado

El siguiente diagrama separa la **operación de devolver** de la **transición derivada a
cancelado**, tanto para el detalle como para el encabezado. No existe una acción independiente
para cancelar una salida ni uno de sus detalles: la devolución confirmada siempre registra el
retorno y el movimiento inverso; sólo una devolución total deriva `Cancelado` para el detalle.
Después, el encabezado deriva cumplimiento `Cancelado` y estado documental `Cancelada`
únicamente cuando **todos** los detalles tienen cumplimiento `Cancelado`. La presencia de un
solo detalle pendiente, parcial o surtido impide cancelar la salida completa.

```mermaid
flowchart TD
    return["Confirmar devolución de un detalle surtido"] --> validate{"Cantidad retornable<br/>y estado válidos?"}
    validate -->|No| rollback["Rollback<br/>sin cambios parciales"]
    validate -->|Sí| effects["Reintegrar existencia<br/>y registrar movimiento inverso"]
    effects --> detail{"Devuelta acumulada =<br/>cantidad surtida?"}
    detail -->|No| detailComplete["Conservar detalle Surtido"]
    detail -->|Sí| detailCanceled["Marcar detalle Cancelado"]
    detailComplete --> aggregate["Recargar todos los detalles"]
    detailCanceled --> aggregate
    aggregate --> allCanceled{"Todos los detalles<br/>están Cancelado?"}
    allCanceled -->|No| derive["Derivar cumplimiento agregado<br/>sin cancelar el encabezado"]
    allCanceled -->|Sí| cancelIssue["Derivar cumplimiento Cancelado<br/>y estado documental Cancelada"]
    derive --> commit["Commit de la devolución"]
    cancelIssue --> commit
```

La fuente de verdad de los nombres y derivación de estados está en
`warehouseStatuses.js`, `issueFulfillmentRules.js` y las reglas específicas de cada
contexto; las transacciones de surtimiento y devolución son la evidencia de sus efectos.
Al modificar una fórmula, estado o regla de agregación se actualizan esta vista,
`CU-SAL-05`, `CU-SAL-06`, `CU-SAL-12`, `CU-SAL-13` y las pruebas paralelas de reglas y servicios. Las pruebas de
integración CRUD continúan en `tests/integration/controllers/*DbTest.js`, conforme a la
estrategia documentada, en vez de trasladarse junto al diagrama.
