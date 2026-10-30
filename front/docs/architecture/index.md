# Arquitectura del frontend Vue

## Implementación

El cliente de Nexus es una SPA de Vue 3 con TypeScript. El navegador ejecuta la interfaz; un
servidor estático entrega `dist` y la API procesa autenticación, permisos y datos.

`app` compone navegación, sesión y módulos. Cada módulo contiene páginas,
componentes, composables y adaptadores de sus operaciones. `shared` reúne los
controles y coordinadores reutilizados.

## Recorrido técnico

| Necesita entender | Referencia |
| --- | --- |
| Cómo arranca la aplicación y se conectan sus capas | [Guía de incorporación](views/development/developer-onboarding.md) y [vista general](views/overview.md). |
| Dónde vive una responsabilidad | [Estructura del código](views/development/code-structure.md). |
| Cómo está construido un módulo | [Recorrido por capacidad](views/index.md#recorrido-por-capacidad). |
| Qué datos intercambian sus componentes y servicios | [Contratos](contracts/index.md) y [modelos TypeScript](views/logical/class-and-type-models/index.md). |
| Cómo se coordina una operación y se recupera un rechazo | [Secuencias](views/processes/index.md) y [estados de interacción](views/logical/states/index.md). |
| Qué mecanismos reutiliza el código | [Patrones y aplicaciones Vue](views/development/design-and-construction-patterns/index.md). |
| Cómo se compila y ejecuta | [Vista física](views/physical/index.md). |
| Por qué se eligió la solución vigente | [Decisiones arquitectónicas](decisions.md). |

La [organización 4+1](views/index.md) agrupa los modelos anteriores por vista.

## Convenciones de implementación

- [Codificación Vue/TypeScript](coding-standards/index.md).
- [Interfaz y accesibilidad](interface-standards.md).
- [Tratamiento seguro de datos](security-standards.md).
