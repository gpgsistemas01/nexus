# Movimientos y trazabilidad

**Identificador:** `DIA-VUE-DOM-005`. **Pregunta:** ¿Cómo se explica un cambio de
existencia sin confundir el historial con un formulario de ajuste?

**Fuentes:** [glosario](../business-glossary.md#documentos-y-trazabilidad-de-inventario),
[casos de movimientos](../use-cases/movements/index.md),
[contratos de consulta](../../architecture/views/logical/class-and-type-models/06-movements-and-queries.md).
**Notación:** conceptos UML; composición del efecto y asociaciones con multiplicidad.

**Lectura visual:** [cajas, flechas y multiplicidades](../../architecture/views/diagram-reading.md#clases-y-dominio).

```mermaid
---
config:
  class:
    hideEmptyMembersBox: true
---
classDiagram
    direction TB
    class DocumentoInventario["Documento<br/>de inventario"]
    class Movimiento
    class EfectoInventario["Efecto de inventario"]
    class OfertaProveedor["Oferta de proveedor"]
    class Merma
    DocumentoInventario "1" -- "0..*" Movimiento : explica
    Movimiento "1" *-- "1..*" EfectoInventario : registra
    EfectoInventario "0..*" -- "0..1" OfertaProveedor : cambia existencia
    EfectoInventario "0..*" -- "0..1" Merma : cambia existencia
    note for EfectoInventario "Oferta o merma, exclusivamente."
```

## Interpretación y restricciones

Compras, surtidos, devoluciones, ajustes y entradas de merma modifican stock; las
solicitudes pendientes no. Cada efecto corresponde a un recurso y un movimiento puede
agrupar varios efectos. Correcciones y devoluciones conservan la referencia original.

El listado Vue muestra una proyección consultable por recurso con referencia, fecha,
tipo, stock anterior, cantidad y nuevo stock. `MovementRow` no es el agregado conceptual
completo ni habilita editar el historial. El filtro y el reporte reutilizan su consulta;
la [secuencia de filtros](../../architecture/views/processes/08-movements-and-reports/01-movement-filters.md)
explica cuándo se aplican y cómo se conserva la consulta previa si son inválidos.
