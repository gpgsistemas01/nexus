# 1. Modelo de dominio conceptual

Se usa `classDiagram`, notación UML soportada por Mermaid. Las clases no representan
clases JavaScript ni copian tablas: son conceptos del negocio. La multiplicidad indica
la relación conceptual vigente; una relación pendiente se omite para no presentar una
intención como parte del dominio operativo.

```mermaid
---
config:
  class:
    hideEmptyMembersBox: true
---
classDiagram
    direction LR
    class Usuario
    class Persona
    class AsignacionAcceso {
        <<abstract>>
    }
    class AsignacionUsuario
    class AsignacionPersona
    class Cliente
    class Proveedor
    class Material
    class Consumible {
        <<classification>>
    }
    class Merma
    class OfertaProveedorMaterial
    class EntradaCompra
    class SalidaMaterial
    class SalidaMerma
    class DetalleEntrada
    class DetalleSalidaMaterial
    class DetalleSalidaMerma
    class Movimiento
    class Existencia

    AsignacionAcceso <|-- AsignacionUsuario
    AsignacionAcceso <|-- AsignacionPersona
    Usuario "1" -- "0..*" AsignacionUsuario : posee
    Persona "1" -- "0..*" AsignacionPersona : desempeña
    Proveedor "1" -- "0..*" OfertaProveedorMaterial : ofrece
    Material "1" -- "0..*" OfertaProveedorMaterial : cotizado como
    Material <|-- Consumible : especialización conceptual
    note for Consumible "Restricción: type = CONSUMABLE. Se persiste en Material."
    Merma ..> Material : usa como plantilla y conserva snapshots
    Proveedor "1" -- "0..*" EntradaCompra : abastece
    EntradaCompra "1" *-- "1..*" DetalleEntrada : contiene
    SalidaMaterial "1" *-- "1..*" DetalleSalidaMaterial : contiene
    SalidaMerma "1" *-- "1..*" DetalleSalidaMerma : contiene
    DetalleEntrada "0..*" -- "1" Material : recibe
    DetalleSalidaMaterial "0..*" -- "1" Material : entrega
    DetalleSalidaMerma "0..*" -- "1" Merma : entrega
    Cliente "0..1" -- "0..*" SalidaMaterial : contextualiza
    EntradaCompra "1" -- "0..*" Movimiento : produce
    SalidaMaterial "1" -- "0..*" Movimiento : produce
    SalidaMerma "1" -- "0..*" Movimiento : produce
    Movimiento "0..*" --> "1" Existencia : modifica
```

`Consumible` representa la clasificación explícita `CONSUMABLE` de una identidad
persistida en `Material`; no es otra tabla ni se infiere por unidad o ausencia de
dimensiones. Reutiliza la oferta, existencia, ajuste y movimiento de material, mientras
sus consultas y reportes se mantienen separados.

`AsignacionUsuario` y `AsignacionPersona` especializan el concepto abstracto de
asignación sin exigir que una misma asignación pertenezca a cuenta y persona a la vez.

`Persona` puede ser solicitante, receptor o referencia comercial sin que eso convierta
a esa persona en usuario. En particular, **asesor** es un dato del contexto comercial,
no un actor con acceso. Los proyectos siguen modelados técnicamente, pero se excluyen de
esta vista vigente hasta definir su flujo.

La composición (`*--`) expresa propiedad de los detalles por su documento; las
asociaciones (`--`) incluyen multiplicidades y no implican llamadas. La dependencia
de Merma hacia Material describe la selección de una plantilla: no afirma una
relación persistente. `«classification»` es un estereotipo local que distingue la
especialización conceptual de una jerarquía de clases o tablas.
