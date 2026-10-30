# Arquitectura del frontend Vue

## Control documental

Estado: En revisión. Responsable: Equipo Nexus. Versión de la colección: [entrada documental](../index.md).

## Propósito y alcance

Nexus permite consultar inventario y registrar compras, salidas, surtidos y
devoluciones. Este documento explica cómo el cliente web presenta esas operaciones
y las conecta con la API. Vue ejecuta la interfaz en el navegador; el alojamiento
entrega los archivos compilados y la API comprueba identidad, permisos y persistencia.

El código se organiza por capacidades del negocio. Una página conecta sesión,
estado y presentación; los composables coordinan las interacciones; los servicios
y mappers preparan solicitudes y adaptan respuestas. La [guía de incorporación](views/development/developer-onboarding.md)
introduce los términos y recorre una edición de catálogo de principio a fin.

## Interesados y preocupaciones

| Interesado | Preocupación | Evidencia documental |
| --- | --- | --- |
| Usuario operativo | Encontrar su módulo, conservar captura y reconocer confirmación o rechazo. | Escenarios, CU y estados de interacción. |
| Desarrollo Vue | Ubicar responsabilidad, compartir comportamiento y evitar dependencias cruzadas. | Componentes, desarrollo, patrones y estándar. |
| Desarrollo API | Conservar campos permitidos, versiones, códigos y contexto del recurso. | Contratos, mappers y procesos. |
| Pruebas/revisión | Identificar riesgo, reproducir condición y limitar lo que demuestra cada nivel. | Casos de uso, DP/CP y matriz de cobertura. |
| Operación | Compilar, servir rutas, conectar API y recuperar errores de configuración. | Vista física y preparación local. |

## Organización 4+1

Una vista reúne modelos que responden una pregunta sobre el sistema. La
[organización 4+1](views/index.md) separa cinco preguntas: objetivos/navegación,
componentes/estado, colaboraciones, organización del código y ejecución. C4 aporta
cortes de contexto/componentes; secuencias y estados utilizan Mermaid con semántica
explicada por figura. El [catálogo de decisiones](decisions.md) registra motivos,
consecuencias y riesgos de la solución vigente.

## Entradas de lectura

La [vista general](views/overview.md) sitúa navegador, aplicación y API.
Para seguir un módulo, el [recorrido por capacidad](views/index.md#recorrido-por-capacidad)
enlaza sus modelos, componentes, estados y procesos.

### Vistas 4+1

1. [Escenarios y navegación](views/scenarios/index.md).
2. [Vista lógica](views/logical/index.md).
3. [Procesos y secuencias](views/processes/index.md).
4. [Desarrollo, patrones y referencia de código](views/development/index.md).
5. [Ejecución y despliegue](views/physical/index.md).

### Contratos y estándares de arquitectura

Los contratos describen interfaces compartidas por varias vistas y forman parte de
esta arquitectura en `front/docs/architecture/contracts/`.

1. [Contratos HTTP y de formularios](contracts/index.md).
2. [Estándar de codificación](coding-standards/index.md).
3. [Estándar de interfaz y accesibilidad](interface-standards.md).
4. [Estándar de seguridad](security-standards.md).

## Restricciones y calidad

Las rutas dependen de historial HTML5/fallback y de un origen coherente para API/cookies.
Los alias públicos se resuelven al compilar desde el checkout. Las listas y selectores
son remotos/paginados. Las mutaciones conservan códigos, versiones e idempotencia según
operación. Las respuestas tardías no deben reemplazar captura vigente. Los criterios
verificables se mantienen en la [especificación del cliente](../requirements/requirements-specification/client-specification.md).

Los contratos tipados y la dirección de dependencias permiten identificar los
consumidores de cada cambio. Las [pruebas](../testing/index.md) observan resultados,
rechazos y recuperación del flujo afectado.

## Mantenimiento

Una modificación de responsabilidad actualiza su vista, contratos y diagramas; un cambio
de código actualiza la referencia generada. La revisión verifica correspondencia entre
fuentes y figuras. Las ejecuciones y resultados pertenecen al registro de pruebas.
