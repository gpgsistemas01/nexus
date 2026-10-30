# 1. Principios de diseño

Vue aporta componentes, composables, props/eventos, slots e inyección. Nexus los
combina con servicios, mappers y callbacks; TypeScript describe los datos y las
variantes de operación. El [índice de patrones](index.md) enlaza cada modelo
general con su aplicación en el código.

## Aplicación de SOLID

| Principio | Aplicación en el código |
| --- | --- |
| Responsabilidad única | Páginas/composables coordinan; componentes presentan; mappers transforman; servicios realizan HTTP. |
| Abierto/cerrado | Slots, configuración y callbacks permiten variar marcos compartidos sin copiar su implementación. |
| Sustitución | Los callbacks deben conservar entradas, resultado, errores y `AbortSignal` del contrato configurado. En estos coordinadores no hay una jerarquía de clases. |
| Segregación de interfaces | Props, eventos y contratos como `LookupState` entregan a cada consumidor los datos y operaciones que necesita. |
| Inversión de dependencias | Los módulos proporcionan consultas y mutaciones a coordinadores compartidos mediante funciones. |

Referencia: [principios SOLID](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html).
