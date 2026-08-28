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

## Vista de requisitos y dependencias

Esta vista contiene **requisitos**, no actores ni casos de uso. Las operaciones del
usuario se muestran exclusivamente en el [diagrama de casos de uso](domain-and-use-cases.md#casos-de-uso-vigentes). Una flecha `A --> B` significa que el cumplimiento de `A`
depende de `B`; no representa navegación, permiso ni interacción humana.

```mermaid
flowchart LR
    auth["RC-SEG-001\nAutenticación y autorización"]
    atomic["RN-002\nAtomicidad documental"]
    quantities["RN-003\nConsistencia de cantidades"]
    trace["RN-005 y RN-008\nHistoria y auditoría"]
    catalogs["RF-CAT-001 a RF-CAT-005\nCatálogos operativos"]
    receipts["RF-REC-001 a RF-REC-003\nEntradas y correcciones"]
    issues["RF-ISS-001 a RF-ISS-004\nSalidas y devoluciones"]
    inventory["RF-INV-001 a RF-INV-003\nExistencias y movimientos"]

    receipts --> auth
    receipts --> catalogs
    receipts --> atomic
    receipts --> trace
    issues --> auth
    issues --> catalogs
    issues --> atomic
    issues --> quantities
    issues --> trace
    receipts --> inventory
    issues --> inventory
```

El texto verificable y el estado de cada identificador se mantienen una sola vez en la
[especificación](requirements-specification.md#4-requisitos-funcionales). La
[matriz de operaciones](requirements-operations-matrix.md#matriz-vigente) documenta los
permisos, y el mapa generado documenta las rutas; repetirlos aquí mezclaría vistas.

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
