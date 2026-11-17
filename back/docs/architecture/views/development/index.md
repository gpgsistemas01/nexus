# Vista de desarrollo de la API

Esta vista explica cómo se organizan e implementan los módulos que atienden la API.
Vue aparece sólo como consumidor de contratos compartidos; su implementación pertenece
a `front/docs`. Las secuencias están en [procesos](../processes/index.md), el despliegue
en [física](../physical/index.md) y las responsabilidades en [lógica](../logical/index.md).

## Organización y recorrido de lectura

| Nivel | Fuente | Pregunta |
| --- | --- | --- |
| Estructura de la API | [Organización del código](code-structure/index.md) | ¿Cómo se registran las rutas, se distribuyen los dominios y se conecta Prisma? |
| Módulos API | [Referencias técnicas](backend-technical-documentation/index.md) | ¿Qué rutas, controladores, servicios, validaciones y pruebas implementan una capacidad? |
| Patrones del servidor | [Patrones de diseño y construcción](design-and-construction-patterns/index.md) | ¿Qué colaboraciones se comparten entre módulos API y cuáles son sus límites? |
| Código reutilizable | [Reutilización y refactorización](reuse-and-refactoring/index.md) | ¿Qué núcleo se comparte y qué configura cada consumidor del servidor? |
| Evidencia técnica | [Mapa generado](code-map.md) | ¿Qué rutas, imports y símbolos existen en `src`? |

Para cambiar una operación, localice su ruta y siga los enlaces del módulo hacia
controller, servicio, persistencia y pruebas. Los contratos públicos pertenecen a
[OpenAPI](../../openapi/index.md); la documentación de Vue explica cómo el cliente
consume esos contratos.

## Propiedad de la información

La carpeta `code-structure` conserva la organización del código API. Las referencias
técnicas poseen los mapas detallados por módulo; los patrones documentan decisiones
repetidas y reutilización conserva los núcleos y configuradores. Cada implementación
tiene una fuente de detalle y enlaces desde las demás colecciones.

```text
development/
├── code-structure/                   # Rutas, módulos API e integración Prisma
├── backend-technical-documentation/  # Implementación por módulo
├── design-and-construction-patterns/ # Colaboraciones del servidor
├── reuse-and-refactoring/            # Núcleos y configuradores
└── code-map.md                       # Inventario generado
```

Los diagramas representan módulos, imports y configuración; cada uno indica alcance,
leyenda y fuente de código. Los recorridos HTTP, reintentos, estados y límites
temporales pertenecen a [procesos](../processes/index.md). El [mapa generado](code-map.md)
sirve para localizar rutas e imports.

Para comenzar a contribuir, consulte la [guía de incorporación](developer-onboarding.md).

## Procesamiento Excel

El [motor Excel](excel-library-decision.md) explica cómo la API procesa libros en
workers temporales y qué límites de recursos aplican a la solicitud.
