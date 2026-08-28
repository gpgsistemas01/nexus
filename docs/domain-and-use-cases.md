# Modelo de dominio, casos de uso y relación entre vistas

## Alcance de las vistas

Este documento contiene dos vistas curadas diferentes: el modelo conceptual explica
el vocabulario del negocio y el diagrama de casos de uso muestra objetivos de actores.
Los campos SQL y cardinalidades físicas están en el
[ER generado](generated/database-schema.md), y los criterios verificables en la
[especificación de requisitos](requirements-specification.md). No se repiten aquí.

## Modelo de dominio conceptual

Se usa `classDiagram`, notación UML soportada por Mermaid. Las clases no representan
clases JavaScript ni copian tablas: son conceptos del negocio. La multiplicidad indica
la relación conceptual vigente; una relación pendiente se omite para no presentar una
intención como parte del dominio operativo.

```mermaid
classDiagram
    class Usuario
    class Persona
    class AsignacionAcceso
    class Cliente
    class Proveedor
    class Material
    class Merma
    class OfertaProveedorMaterial
    class EntradaCompra
    class SalidaMaterial
    class SalidaMerma
    class DetalleDocumento
    class Movimiento
    class Existencia

    Usuario "1" --> "0..*" AsignacionAcceso : posee
    Persona "1" --> "0..*" AsignacionAcceso : desempeña
    Proveedor "1" --> "0..*" OfertaProveedorMaterial : ofrece
    Material "1" --> "0..*" OfertaProveedorMaterial : cotizado como
    Material "1" --> "0..*" Merma : origina
    Proveedor "1" --> "0..*" EntradaCompra : abastece
    EntradaCompra "1" *-- "1..*" DetalleDocumento : contiene
    SalidaMaterial "1" *-- "1..*" DetalleDocumento : contiene
    SalidaMerma "1" *-- "1..*" DetalleDocumento : contiene
    Cliente "0..1" --> "0..*" SalidaMaterial : contextualiza
    Material "1" --> "0..*" SalidaMaterial : se entrega en
    Merma "1" --> "0..*" SalidaMerma : se entrega en
    EntradaCompra "1" --> "0..*" Movimiento : produce
    SalidaMaterial "1" --> "0..*" Movimiento : produce
    SalidaMerma "1" --> "0..*" Movimiento : produce
    Movimiento "0..*" --> "1" Existencia : modifica
```

`Persona` puede ser solicitante, receptor o referencia comercial sin que eso convierta
a esa persona en usuario. En particular, **asesor** es un dato del contexto comercial,
no un actor con acceso. Los proyectos siguen modelados técnicamente, pero se excluyen de
esta vista vigente hasta definir su flujo.

## Casos de uso vigentes

El diagrama se mantiene en Mermaid para que GitHub lo represente correctamente. Es una
**aproximación visual a un diagrama UML de casos de uso**, no UML estricto: Mermaid no
ofrece ese tipo de diagrama y se emplean nodos de `flowchart` con la semántica que se
explica a continuación. Los límites rectangulares representan el sistema; los actores
quedan fuera. Las asociaciones
muestran quién inicia un objetivo y no equivalen a permisos individuales. Ventas no es
actor: el área no tiene acceso. Tampoco se asignan salidas a otras áreas solicitantes;
su participación futura queda pendiente de definición.

Las precondiciones, flujo principal, alternativas y resultados de cada objetivo se
detallan por tema en el [catálogo de descripciones de casos de uso](use-case-descriptions.md).
El diagrama conserva únicamente la vista visual para no duplicar esas descripciones.

```mermaid
flowchart LR
    warehouse["Personal de almacén"]
    admin["Administración del sistema"]

    subgraph nexus["Nexus"]
        ucCatalogs(["Mantener catálogos de almacén"])
        ucReceipts(["Registrar y corregir entradas"])
        ucIssues(["Crear y editar salidas"])
        ucSupply(["Surtir detalles"])
        ucReturn(["Devolver detalles surtidos"])
        ucMovements(["Consultar movimientos y reportes"])
        ucIdentity(["Administrar personas, usuarios y accesos"])
        ucClients(["Mantener clientes como catálogo contextual"])
    end

    warehouse --- ucCatalogs
    warehouse --- ucReceipts
    warehouse --- ucIssues
    warehouse --- ucSupply
    warehouse --- ucReturn
    warehouse --- ucMovements
    admin --- ucIdentity
    admin --- ucClients
    admin --- ucMovements
    ucSupply -.->|incluye existencia y movimiento| ucMovements
    ucReturn -.->|incluye reversión y movimiento| ucMovements
```

No se dibujan operaciones pendientes como asociaciones. Las áreas que eventualmente
soliciten o registren salidas, y el mantenimiento de proyectos, deben definirse primero
como alcance, permisos y criterios de aceptación.

## Estados y datos modificados por acción

Los modos de formulario (`crear`, `editar`, `surtir`, `devolver`) no son estados del
documento. El siguiente UML de estados muestra las precondiciones de negocio comunes a
salidas de material y merma; las diferencias específicas se consultan en la
[matriz de operaciones](requirements-operations-matrix.md#modos-precondiciones-y-datos-modificados).

```mermaid
stateDiagram-v2
    [*] --> Borrador: crear encabezado y detalles
    Borrador --> Borrador: editar encabezado o detalles
    Borrador --> Parcial: surtir parte de una cantidad
    Borrador --> Surtida: surtir todas las cantidades
    Parcial --> Parcial: surtir otra parte o devolver parte
    Parcial --> Surtida: completar surtimiento
    Surtida --> Parcial: devolver parte
    Surtida --> Devuelta: devolver todo lo surtido
    Borrador --> Cancelada: cancelar cuando el flujo lo permita
    Parcial --> Cancelada: cancelar sólo con regla autorizada
    Devuelta --> [*]
    Cancelada --> [*]
```

## Vistas de diseño del sistema

El diseño no se duplica en este archivo. Consulta la
[arquitectura del sistema](architecture-and-web-views.md#1-arquitectura-del-sistema)
para contexto, contenedores, despliegue, componentes y secuencia; el
[mapa generado](generated/code-map.md) para imports y rutas; y el
[ER](generated/database-schema.md) para diseño físico de datos. La vista de despliegue
distingue el entorno vigente en Render y Supabase del objetivo de trasladar la
aplicación a un VPS; los detalles todavía no decididos se presentan como propuesta y
no como infraestructura implementada.
