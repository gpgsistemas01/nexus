# Arquitectura del frontend Vue

## Control documental

Estado: En revisión. Responsable: Equipo Nexus. Versión de la colección: [entrada documental](../index.md).

## Propósito y alcance

La aplicación es una SPA cliente-servidor, organizada por dominios funcionales,
componentes de presentación, coordinadores reactivos y adaptadores HTTP. Vue se
ejecuta en el navegador; el alojamiento entrega sus assets y la API resuelve
identidad, autorización y persistencia. Este documento es la entrada a sus vistas,
contratos y reglas de construcción.

## Interesados y preocupaciones

| Interesado | Preocupación | Evidencia documental |
| --- | --- | --- |
| Usuario operativo | Encontrar su módulo, conservar captura y reconocer confirmación o rechazo. | Escenarios, CU y estados de interacción. |
| Desarrollo Vue | Ubicar responsabilidad, compartir comportamiento y evitar dependencias cruzadas. | Desarrollo, patrones, módulos y estándar. |
| Desarrollo API | Conservar campos permitidos, versiones, códigos y contexto del recurso. | Contratos, mappers y procesos. |
| Pruebas/revisión | Identificar riesgo, reproducir condición y limitar lo que demuestra cada nivel. | Casos de uso, DP/CP y matriz de cobertura. |
| Operación | Compilar, servir rutas, conectar API y recuperar errores de configuración. | Vista física y preparación local. |

## Organización 4+1

La [colección de vistas](views/index.md) organiza cinco preguntas: objetivos/navegación,
componentes/estado, colaboraciones, organización del código y ejecución. C4 aporta
cortes de contexto/componentes; secuencias y estados utilizan Mermaid con semántica
explicada por figura. El [catálogo de decisiones](decisions.md) registra motivos,
consecuencias y riesgos de la solución vigente.

## Entradas de lectura

1. [Escenarios y navegación](views/scenarios/index.md).
2. [Vista lógica](views/logical/index.md).
3. [Procesos y secuencias](views/processes/index.md).
4. [Desarrollo, patrones y realización por módulo](views/development/index.md).
5. [Ejecución y despliegue](views/physical/index.md).
6. [Contratos HTTP del cliente](contracts/index.md).
7. [Estándar de codificación](coding-standards/index.md).

## Restricciones y calidad

Las rutas dependen de historial HTML5/fallback y de un origen coherente para API/cookies.
Los alias públicos se resuelven al compilar desde el checkout. Las listas y selectores
son remotos/paginados. Las mutaciones conservan códigos, versiones e idempotencia según
operación. Las respuestas tardías no deben reemplazar captura vigente. Los criterios
verificables se mantienen en la [especificación del cliente](../requirements/requirements-specification/client-specification.md).

La mantenibilidad se evalúa mediante contratos, dirección de dependencias, consumidores
y pruebas relevantes. La configuración actual no acredita capacidad concurrente ni un
SLA de producción; esas obligaciones necesitan escenarios y mediciones propios.

## Mantenimiento

Una modificación de responsabilidad actualiza su vista, contratos y diagramas; un cambio
de código actualiza la referencia generada. La revisión verifica correspondencia entre
fuentes y figuras. Las ejecuciones y resultados pertenecen al registro de pruebas.
