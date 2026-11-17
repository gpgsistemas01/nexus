# Documentación de Nexus Vue

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.16 | 1.0.0 | En revisión | 2026-11-16 | Equipo Nexus |

Esta colección describe qué hace el cliente, cómo está construido y cómo se usa.
Las instrucciones de instalación, comandos y publicación están agrupadas en
[Desarrollo para programadores](development/index.md).

## Encuentra una respuesta

| Pregunta | Fuente | Contenido |
| --- | --- | --- |
| ¿Qué resultados, reglas y estados presenta Vue? | [Requisitos](requirements/index.md) | Actores, reglas funcionales, estados, excepciones y casos de uso. |
| ¿Cómo se compone el cliente y cómo conversa con la API? | [Arquitectura](architecture/index.md) | Navegación, componentes, procesos, modelos, contratos y despliegue. |
| ¿Qué tipos, convenciones y patrones se usan en el código? | [Estándar de código](architecture/coding-standards/index.md) y [referencia de código](architecture/views/development/index.md) | Estructura, responsabilidades, interfaces y reutilización. |
| ¿Cómo verifico una regla o flujo? | [Pruebas](testing/index.md) | Plan, casos, cobertura y pruebas del sistema. |
| ¿Cómo opera una persona usuaria? | [Manual de usuario](user-manual/index.md) | Procedimientos por módulo, campos, resultados y recuperación. |
| ¿Cómo se mantiene y publica la documentación? | [Gobernanza](governance/index.md) | Fuentes propietarias, revisión y generación. |

## Recorridos útiles

- **Entender una operación:** requisito o caso de uso → componente → contrato →
  proceso → prueba asociada.
- **Localizar una regla:** [especificación](requirements/requirements-specification/index.md)
  → regla y excepción → caso de uso relacionado.
- **Seguir una respuesta de API:** [contratos](architecture/contracts/index.md)
  → adaptador HTTP y servicio → [prueba](testing/02-test-design.md).
- **Incorporarse al código:** [inicio local](development/01-getting-started.md)
  → [recorrido del código](architecture/views/development/developer-onboarding.md).
- **Operar una pantalla:** [manual](user-manual/index.md) → procedimiento del módulo.

## Trazabilidad

La [guía de trazabilidad](requirements/01-applicability-and-traceability.md)
conecta requisito, caso de uso, realización y prueba. La
[matriz de cobertura](testing/04-use-case-coverage.md) resume qué condiciones se
verifican y con qué nivel de prueba.
