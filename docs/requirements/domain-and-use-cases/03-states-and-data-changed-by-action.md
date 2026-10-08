# 3. Estados y datos modificados por acción

Los modos de formulario (`crear`, `editar`, `surtir`, `devolver`) no son estados del
documento. El siguiente UML usa exclusivamente los nombres persistidos que resuelve el
código (`Pendiente`, `Surtido parcial`, `Surtido` y `Cancelado`); por tanto, no presenta
`Borrador` o `Devuelta` como estados aunque esas palabras puedan describir una acción o
una condición funcional. La máquina resume el **cumplimiento agregado** común a salidas
de material y merma. El estado de cada detalle y el del encabezado se derivan después de
la operación, no se asignan desde el formulario.

Las diferencias de permisos, campos y efectos se consultan en la
[modos, precondiciones y efectos](../requirements-specification/06-operation-modes-and-effects.md),
y las reglas verificables están en `src/constants/warehouseStatuses.js`,
`src/services/warehouse/issues/issueFulfillmentRules.js` y los servicios específicos de
salidas de material y merma.

```mermaid
stateDiagram-v2
    state "Pendiente" as Pendiente
    state "Surtido parcial" as Parcial
    state "Surtido" as Surtida
    state "Cancelado" as Cancelada
    [*] --> Pendiente: crear [datos válidos] / guardar sin descontar stock
    Pendiente --> Pendiente: editar [campos admitidos] / actualizar documento
    Pendiente --> Parcial: surtir [cantidad parcial y stock suficiente] / recalcular cumplimiento
    Pendiente --> Surtida: surtir [todos los detalles completos] / recalcular cumplimiento
    Parcial --> Parcial: surtir [quedan cantidades pendientes] / recalcular cumplimiento
    Parcial --> Surtida: surtir [todos los detalles completos] / recalcular cumplimiento
    Surtida --> Surtida: devolver [cantidad parcial] / revertir stock y movimiento
    Surtida --> Cancelada: devolver [todos los detalles cancelados] / recalcular cumplimiento
    Parcial --> Cancelada: devolver [todos los detalles cancelados] / recalcular cumplimiento
    Cancelada --> [*]
```

`Parcial` es la etiqueta abreviada de cumplimiento `Surtido parcial` y `Surtida` representa
el cumplimiento persistido `Surtido`. La devolución es una operación, no un estado ni un
sinónimo de cancelar: una devolución parcial conserva el detalle `Surtido`, mientras que
devolver todo lo surtido deriva `Cancelado` para ese detalle. Sólo cuando todos los detalles
resultan cancelados se derivan cumplimiento `Cancelado` y estado documental `Cancelada`
para el encabezado. Esta aclaración evita interpretar el diagrama como un catálogo adicional
de estados o como una acción independiente de cancelación.
