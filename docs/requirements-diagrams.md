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
un flujo parcial o todavía pendiente. Cada caso se detalla mediante uno o
más requisitos `RF` en la especificación, sin convertir este mapa en un inventario de
endpoints.

```mermaid
flowchart LR
    warehouse["Personal de almacén"]
    sales["Ventas / asesoría"]
    admin["Administración"]
    subgraph inventory["Inventario y abastecimiento"]
        catalogs["Gestionar materiales,<br/>proveedores y catálogos editables"]
        receipts["Registrar entradas con partidas independientes<br/>y corregir partidas persistidas"]
        issues["Registrar salidas de material,<br/>surtir y devolver"]
        wastes["Nombrar y gestionar existencias de merma,<br/>registrar salidas, surtir y devolver"]
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
    sales --> clients
    sales -.->|"pendiente"| projects
    sales --> issues
    admin --> people
    admin --> reports
    admin --> audit
```

## Ciclo vigente de los requisitos CRUD

Los catálogos reutilizan un mismo ciclo de interacción, con autorización y validación
particulares según el recurso. La eliminación física sólo aparece cuando las relaciones
del dominio la permiten; en los demás casos el ciclo usa activación, desactivación o
cancelación. Los documentos operativos reutilizan listado y formulario, pero agregan
acciones de detalle, stock y movimiento sin presentarlas como un CRUD idéntico.

```mermaid
flowchart LR
    list["Consultar listado<br/>filtros y paginación"] --> create["Crear<br/>validar identidad y relaciones"]
    create --> refresh["Persistir y refrescar listado"]
    list --> edit["Actualizar<br/>conservar campos inmutables"]
    edit --> refresh
    list --> removal{"¿El dominio permite<br/>eliminación física?"}
    removal -->|"sí y sin relaciones protegidas"| delete["Eliminar"]
    removal -->|"no"| status["Activar, desactivar<br/>o cancelar"]
    delete --> refresh
    status --> refresh
    refresh --> list

    list --> document["Documento operativo<br/>encabezado y detalles"]
    document --> transaction["Acción atómica<br/>detalle · stock · movimiento"]
    transaction --> list
```

Las flechas representan transiciones observables del usuario, no endpoints concretos.
La bifurcación de eliminación aplica `RN-007`; el límite atómico aplica `RN-002`. La
matriz de operaciones define cuál de estas ramas existe realmente para cada módulo.

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
    validation --> unit["Pruebas unitarias en ruta paralela<br/>validators · DTO · controller · service · UI CRUD"]
    route --> integration["Integración CRUD HTTP + Prisma<br/>tests/integration/controllers/*DbTest.js"]
    schema --> integration
    route --> generated["Mapa generado y<br/>comprobación de CI"]
```

Al modificar un requisito se revisan su ruta, autorización, validación, persistencia y
pruebas relacionadas. La ubicación y estrategia de estas últimas se detalla en
[Estrategia y cobertura de pruebas](service-test-coverage.md).
