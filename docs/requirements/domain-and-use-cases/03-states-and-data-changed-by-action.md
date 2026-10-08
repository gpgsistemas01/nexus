# 3. Estados y datos modificados por acción

Los diagramas muestran estados de negocio. Las etiquetas **acción [condición]**
conservan las guardas que distinguen transiciones; los efectos de inventario se
resumen al final. Los modos de formulario no son estados.

## Cumplimiento de una salida de material, consumible o merma

El ciclo es común a los tres tipos de salida. Cada detalle seleccionado se surte por
toda su cantidad pendiente; la salida queda parcialmente surtida si quedan otros
detalles pendientes. Sólo se devuelve cuando la salida completa está `Surtido`.

```mermaid
stateDiagram-v2
    direction TB
    state "Pendiente" as Pendiente
    state "Surtido parcial" as Parcial
    state "Surtido" as Surtido
    state "Cancelado" as Cancelado
    [*] --> Pendiente: registrar salida
    Pendiente --> Parcial: surtir [parte de los detalles pendientes]
    Pendiente --> Surtido: surtir [todos los detalles pendientes]
    Parcial --> Parcial: surtir [parte de los pendientes]
    Parcial --> Surtido: surtir [todos los pendientes]
    Surtido --> Surtido: devolver [no completa todos los saldos]
    Surtido --> Cancelado: devolver [último saldo completo]
    Cancelado --> [*]
```

La salida pasa a cumplimiento `Cancelado` y estado general `Cancelada` sólo cuando
todos sus detalles están íntegramente devueltos; no existe cancelación directa.

## Cumplimiento de un detalle de material, consumible o merma

El saldo entregado es la cantidad surtida menos las devoluciones anteriores.
Una devolución parcial conserva `Surtido`; devolver todo el saldo cancela el detalle.

```mermaid
stateDiagram-v2
    direction TB
    state "Pendiente" as Pendiente
    state "Surtido" as Surtido
    state "Cancelado" as Cancelado
    [*] --> Pendiente: registrar detalle
    Pendiente --> Surtido: surtir toda la cantidad pendiente
    Surtido --> Surtido: devolver [parte del saldo]
    Surtido --> Cancelado: devolver [todo el saldo]
    Cancelado --> [*]
```

## Estado de una compra de material o consumible

La compra recibida queda `Confirmada`. Cancelar algunos detalles conserva ese estado;
cancelar el último detalle activo deja la compra `Cancelada`.

```mermaid
stateDiagram-v2
    direction TB
    state "Confirmada" as Confirmada
    state "Cancelada" as Cancelada
    [*] --> Confirmada: registrar compra
    Confirmada --> Confirmada: cancelar detalle [quedan otros activos]
    Confirmada --> Cancelada: cancelar detalle [último activo]
    Cancelada --> [*]
```

## Estado de un detalle de compra

Corregir cantidad o costo conserva el detalle `Activo` y su historia.
Cancelar el detalle lo deja `Cancelado`.

```mermaid
stateDiagram-v2
    direction TB
    state "Activo" as Activo
    state "Cancelado" as Cancelado
    [*] --> Activo: registrar detalle
    Activo --> Activo: corregir cantidad o costo
    Activo --> Cancelado: cancelar recepción
    Cancelado --> [*]
```

## Reglas y efectos comunes

Todas las acciones requieren autorización y datos válidos. Surtir exige existencia
suficiente; devolver no puede superar el saldo entregado; reducir o cancelar una
recepción exige existencia suficiente para revertirla. Un rechazo conserva el estado
y no confirma cambios.

| Acción | Efecto de inventario |
| --- | --- |
| Registrar salida o editar datos generales | No modifica existencias. |
| Registrar compra o agregar un detalle de compra | Incorpora las cantidades recibidas. |
| Surtir | Descuenta las cantidades entregadas. |
| Devolver | Repone las cantidades recibidas de vuelta. |
| Corregir o cancelar un detalle de compra | Ajusta la diferencia o revierte su recepción. |

El final cierra el ciclo operativo; los documentos, detalles y su historia permanecen
consultables. Los campos, condiciones de edición y reglas completas se mantienen en
[Modos, precondiciones y efectos](../requirements-specification/06-operation-modes-and-effects.md)
y en el [catálogo de casos de uso](../use-cases/index.md).
