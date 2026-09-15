# 2. Dos lecturas complementarias

Nexus separa deliberadamente dos preguntas que no deben resolverse en el mismo nivel de
detalle:

| Lectura | Pregunta | Notación y vocabulario | Fuente |
| --- | --- | --- | --- |
| Funcional | ¿Qué objetivo cumple el actor y qué resultado espera? | Aproximación UML de casos de uso y lenguaje del negocio, sin métodos ni variables. | [Modelo y casos de uso](../../requirements/domain-and-use-cases.md#casos-de-uso-vigentes). |
| Ejecución | ¿Qué archivos, símbolos, llamadas y datos ejecutan ese objetivo? | Secuencia Mermaid con semántica UML y notación literal de JavaScript/HTTP cuando corresponde. | [Secuencias backend](../backend-code-sequences/index.md) y [secuencias frontend](../frontend-code-sequences/index.md). |

El identificador `CU-*` enlaza ambas lecturas, pero no convierte una secuencia técnica en
un diagrama UML de casos de uso. En la lectura funcional se conserva el lenguaje accesible;
en la lectura de ejecución se escriben firmas como `función(argumento)`, métodos HTTP,
rutas, DTO/payload y `tx` cuando esos datos permiten seguir el flujo real. No se añaden
variables locales que no cambien una colaboración, decisión o resultado observable.
