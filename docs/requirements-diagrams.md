# Diagramas de requisitos

Este documento resume visualmente el alcance observable de Nexus y relaciona actores,
capacidades y atributos de calidad. La definición, estado, criterios de aceptación y
reglas de negocio se detallan en la
[especificación de requisitos](requirements-specification.md). Este archivo es un mapa
para conversación y revisión: las rutas del
[mapa generado](generated/code-map.md), el esquema Prisma y las pruebas siguen siendo
las fuentes verificables de implementación. Estas vistas aplican las
[convenciones y patrones para diagramas](diagram-conventions.md): cada sección conserva
un propósito, alcance, semántica y fuente de verdad definidos.

## Casos de uso funcionales por actor

Las flechas continuas representan capacidades disponibles; la línea discontinua indica
un caso modelado cuyo flujo todavía está pendiente. Cada caso se detalla mediante uno o
más requisitos `RF` en la especificación, sin convertir este mapa en un inventario de
endpoints.

```mermaid
flowchart LR
    warehouse["Personal de almacén"]
    sales["Ventas / asesoría"]
    admin["Administración"]
    approver["Solicitante / aprobador"]
    subgraph inventory["Inventario y abastecimiento"]
        catalogs["Gestionar materiales,<br/>presentaciones y proveedores"]
        requisitions["Modelar requisiciones<br/>(flujo web/API pendiente)"]
        receipts["Registrar y corregir<br/>entradas de compra"]
        issues["Registrar salidas,<br/>entregas y devoluciones"]
        wastes["Gestionar existencias,<br/>salidas y devoluciones de merma"]
        adjustments["Solicitar y aplicar<br/>ajustes de stock"]
    end
    subgraph governance["Administración y control"]
        people["Gestionar personas,<br/>usuarios y accesos"]
        clients["Gestionar clientes"]
        projects["Gestionar proyectos<br/>(flujo pendiente)"]
        reports["Consultar movimientos<br/>y exportar reportes"]
        audit["Conservar trazabilidad<br/>de escrituras críticas"]
    end
    warehouse --> catalogs
    warehouse --> receipts
    warehouse --> issues
    warehouse --> wastes
    warehouse -.->|"parcial"| adjustments
    approver -.->|"pendiente"| requisitions
    approver --> issues
    sales --> clients
    sales -.->|"pendiente"| projects
    sales --> issues
    admin --> people
    admin --> reports
    admin --> audit
```

## Ciclo de los requisitos CRUD

Los catálogos reutilizan un mismo ciclo de interacción, con autorización, validación y
reglas particulares según el recurso. Los documentos operativos agregan estados y
acciones de negocio sin duplicar el CRUD base.

```mermaid
stateDiagram-v2
    [*] --> Listado: consultar con filtros y paginación
    Listado --> Alta: crear
    Alta --> Listado: guardar y refrescar
    Listado --> Edición: seleccionar
    Edición --> Listado: guardar y refrescar
    Listado --> CambioEstado: activar / desactivar o cancelar
    CambioEstado --> Listado: confirmar y refrescar
    Listado --> [*]
```

## Requisitos de calidad y restricciones

```mermaid
flowchart TB
    nexus["Nexus"]
    security["Seguridad<br/>autenticación, permisos por rol/área<br/>y separación de credenciales"]
    integrity["Integridad<br/>transacciones, claves y restricciones<br/>de inventario"]
    traceability["Trazabilidad<br/>referencias, movimientos y auditoría<br/>del actor"]
    usability["Usabilidad<br/>flujos consistentes, componentes<br/>reutilizables y retroalimentación"]
    maintainability["Mantenibilidad<br/>capas por dominio, pruebas CRUD<br/>y documentación verificable"]
    operability["Operabilidad<br/>migraciones reproducibles, logs<br/>y comprobaciones de CI"]
    nexus --> security
    nexus --> integrity
    nexus --> traceability
    nexus --> usability
    nexus --> maintainability
    nexus --> operability
```

## Trazabilidad del requisito a la evidencia

```mermaid
flowchart LR
    requirement["Requisito"] --> route["Ruta web / API"]
    route --> validation["Permiso y validadores"]
    validation --> controller["Controller / DTO"]
    controller --> service["Servicio de dominio"]
    service --> schema["Prisma / migración"]
    controller --> unit["Prueba unitaria<br/>tests/unit/controllers"]
    service --> integration["Prueba CRUD con BD<br/>tests/integration/controllers"]
    route --> generated["Mapa generado y<br/>comprobación de CI"]
```

Al modificar un requisito se revisan su ruta, autorización, validación, persistencia y
pruebas relacionadas. La ubicación y estrategia de estas últimas se detalla en
[Estrategia y cobertura de pruebas](service-test-coverage.md).
