# Coordinación atómica de correcciones de entrada

Esta secuencia ayuda a desarrollo y pruebas a localizar el límite de `CU-ENT-04` y `CU-ENT-05`. Su alcance comienza después de autorizar y validar la petición y termina con la
respuesta del servicio. Los mensajes dentro del bloque **Transacción Prisma** son una
unidad: cualquier excepción revierte todos sus efectos. La actualización del costo
unitario ocurre después del commit y no forma parte de esa unidad.

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as Servicio de corrección/cancelación
    participant T as Transacción Prisma
    participant I as Inventario y movimientos
    participant D as Entrada, detalle e historial
    participant U as Costo unitario

    C->>S: corregir o cancelar detalle validado
    S->>T: iniciar transacción
    T->>D: obtener detalle y comprobar estado
    D-->>T: snapshot vigente
    T->>T: calcular diferencia y tipo de cambio
    alt corrección o cancelación válida
        T->>I: aplicar diferencia de inventario y movimiento
        I-->>T: movimiento trazable
        T->>D: actualizar detalle y totales
        T->>D: registrar valores anterior/resultante, motivo y actor
        T-->>S: commit con resultado coordinado
        S->>U: recalcular costo del material/proveedor
        S-->>C: detalle, entrada, cambio y movimiento
    else estado, cantidad, stock o motivo inválido
        T-->>S: rollback sin cambios parciales
        S-->>C: error de dominio
    end
```

Las flechas son llamadas coordinadas, no endpoints. La fuente verificable son
`goodsReceiptCorrectionService.js`, `goodsReceiptCancellationService.js` y sus ayudas de
inventario; el detalle contractual permanece en `CU-ENT-04` y `CU-ENT-05`. Si cambia el orden de las
escrituras, el límite transaccional o el recálculo posterior, deben actualizarse esta
vista y las pruebas unitarias ubicadas en la ruta paralela del servicio. El CRUD HTTP de
entradas conserva su cobertura de integración en `tests/integration/controllers`.
