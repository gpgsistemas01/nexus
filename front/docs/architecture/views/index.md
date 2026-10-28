# Vistas arquitectónicas

La organización 4+1 mantiene una fuente por preocupación y enlaza requisitos,
realización y pruebas. Una vista puede usar varias notaciones si responden preguntas
complementarias. La [vista general](overview.md) contiene el contexto y el corte de componentes.

| Vista | Pregunta | Artefactos |
| --- | --- | --- |
| [Escenarios (+1)](scenarios/index.md) | ¿Qué objetivo se realiza y cómo se llega a él? | Catálogo de pantallas, navegación y casos de uso. |
| [Lógica](logical/index.md) | ¿Qué componentes, contratos y estados colaboran? | Componentes por dominio, clases/interfaces/tipos, propiedad de datos y estados. |
| [Procesos](processes/index.md) | ¿En qué orden se coordina una operación? | Ocho secciones de secuencias con decisiones, vigencia, rechazo y recuperación. |
| [Desarrollo](development/index.md) | ¿Dónde vive el código y cómo se reutiliza? | Estructura, patrones, guías de módulo y referencia generada. |
| [Física](physical/index.md) | ¿Dónde se ejecuta y qué configuración necesita? | Vite, alojamiento estático, proxy, build e imagen final. |

## Lectura visual

La [guía de diagramas](diagram-reading.md) explica símbolos, líneas, números,
agrupaciones y color mediante ejemplos breves. Cada figura añade su significado local.
El [dominio](../../requirements/domain-model/index.md) pertenece a requisitos;
las [interfaces y tipos](logical/class-and-type-models/index.md), a la vista lógica.

## Trazabilidad de las figuras entre vistas

| Preocupación | Figura y detalle |
| --- | --- |
| Objetivos del actor (+1) | [Casos de uso por recurso](scenarios/use-case-model/index.md), con actores y límite Nexus; [pantallas](scenarios/navigation-and-screens.md) enlaza sus entradas. |
| Conceptos del negocio (entrada a las vistas) | [Cinco cortes de dominio](../../requirements/domain-model/index.md): identidad, existencias, compras, salidas y trazabilidad. |
| Responsabilidades (lógica) | [Cortes de siete dominios](logical/components/index.md), [modelos de clases/interfaces/tipos](logical/class-and-type-models/index.md), [estados por responsabilidad](logical/states/index.md). |
| Orden y recuperación (procesos) | [Índice de secuencias](processes/index.md), con operación, CU y figura; [actividad de merma](processes/05-warehouse/05-waste-preview.md) detalla el cálculo de preview. |
| Construcción (desarrollo) | [Patrones generales y aplicados](development/design-and-construction-patterns/index.md), [referencias breves por módulo](development/frontend-technical-documentation/index.md) y [código generado](development/code-reference.md). |
| Ejecución (física) | [Topología local y frontera del build](physical/runtime-and-build.md), complementada por configuración de alojamiento/proxy. |

## Recorrido por capacidad

| Capacidad | Modelo conceptual y contratos | Estructura y comportamiento |
| --- | --- | --- |
| Acceso | [Cuenta/persona](../../requirements/domain-model/01-identity-and-organization.md), [sesión/login](logical/class-and-type-models/01-session-and-login.md). | [Componentes](logical/components/01-access.md), [sesión y renovación](processes/01-session/index.md). |
| Inventario | [Artículo/oferta/merma](../../requirements/domain-model/02-items-and-stock.md), [tipos de inventario](logical/class-and-type-models/05-inventory.md). | [Componentes](logical/components/02-inventory.md), [procesos](processes/05-warehouse/index.md), [pendiente](logical/states/03-waste-capture.md). |
| Catálogos y directorio | [Conceptos comerciales](../../requirements/domain-model/02-items-and-stock.md), [valores y filas](logical/class-and-type-models/03-catalogs-and-directory.md). | [Catálogos](logical/components/03-catalogs.md), [directorio](logical/components/04-identity-directory.md), [guardado](processes/03-catalogs-and-directory/index.md). |
| Personas/cuentas | [Organización](../../requirements/domain-model/01-identity-and-organization.md), [tipos de identidad](logical/class-and-type-models/04-identity.md). | [Componentes](logical/components/04-identity-directory.md), [responsabilidades y cuentas](processes/04-identity/index.md). |
| Movimientos | [Trazabilidad](../../requirements/domain-model/05-movements.md), [filtros/filas](logical/class-and-type-models/06-movements-and-queries.md). | [Componentes](logical/components/05-movements.md), [filtros y reportes](processes/08-movements-and-reports/index.md). |
| Compras | [Recepción](../../requirements/domain-model/03-purchases.md), [contratos](logical/class-and-type-models/07-purchases.md). | [Componentes](logical/components/06-purchases.md), [estados](logical/states/01-purchases.md), [secuencias](processes/06-purchases/index.md). |
| Salidas | [Solicitud/entrega](../../requirements/domain-model/04-issues.md), [contratos](logical/class-and-type-models/08-issues.md). | [Componentes](logical/components/07-issues.md), [estados](logical/states/02-issues.md), [secuencias](processes/07-issues/index.md). |
| Reutilización | [Páginas/opciones/errores](logical/class-and-type-models/02-shared-contracts.md). | [Procesos compartidos](processes/02-shared-runtime/index.md), [patrones generales y aplicados](development/design-and-construction-patterns/index.md). |
