# 4. Reglas del proyecto, recomendaciones y criterios de aceptación

## Propósito

Esta guía explica cómo interpretar una instrucción de la documentación y quién puede
modificarla. El equipo mantiene un acuerdo común para que dos implementaciones del
mismo contrato se comporten de forma consistente y puedan revisarse con la misma base.
Las decisiones de una persona se ejercen dentro de esos contratos y convenciones.

## Tipos de enunciado

| Tipo | Qué significa | Ejemplo en Nexus | Fuente y comprobación |
| --- | --- | --- | --- |
| Requisito o criterio de aceptación | Resultado funcional que el sistema debe ofrecer y que permite aceptar o rechazar un caso. | Devolver una cantidad positiva sin exceder lo entregado disponible. | RF/RN, ficha CU y pruebas; el servidor comprueba el saldo vigente. |
| Regla de construcción | Convención común que protege compatibilidad, seguridad o una frontera del código. | Presentación sin HTTP, imports con extensión y props sin mutación. | Estándar, configuración ESLint/TypeScript y revisión de dependencias. |
| Formato automatizado | Presentación del código fijada por la configuración del repositorio. | Cuatro espacios en SFC, comillas simples y separaciones entre bloques. | EditorConfig, Prettier, ESLint y sus comandos de comprobación. |
| Recomendación | Orientación que requiere juicio según el contexto; puede existir una solución distinta con el mismo contrato. | Extraer un helper si concentra una responsabilidad y tiene consumidores reales. | Motivo de cambio, legibilidad, consumidores y evidencia del comportamiento. |
| Decisión de diseño | Descripción de la solución implementada y del motivo que la sostiene. | Sesión por aplicación mediante provide/inject y captura por instancia. | Código y ADR; cambiarla exige revisar consumidores y consecuencias. |
| Resultado de ejecución | Evidencia de lo ocurrido en un ambiente y revisión concretos. | Prueba de devolución aprobada o fallida con sus datos. | EP, comando, ambiente y artefactos de la corrida. |

## Cómo leer el lenguaje

«Debe», «requiere» o una prohibición expresa identifican una obligación del contrato
o del estándar, con la fuente correspondiente. «Se recomienda» y «preferir» indican
una orientación. «El código utiliza» describe implementación; no convierte esa elección
en una obligación general para todos los proyectos Vue.

Un criterio de aceptación tiene condición y resultado observable. Por ejemplo:
«con saldo leído 2, capturar devolución 3 muestra error y no envía la solicitud».
«El código debe ser bueno» no es un criterio verificable. El tipo de evidencia se
elige según el riesgo: validar ese formulario no demuestra el saldo persistido.

## Decisiones individuales y cambios compartidos

La persona que desarrolla elige nombres locales, descomposición y algoritmo cuando
el contrato y el estándar dejan varias opciones válidas. La elección se explica si
introduce una responsabilidad, dependencia o costo de mantenimiento relevante.
Una preferencia personal no sustituye el formateador ni altera un payload compartido.

Cambiar una regla del proyecto implica identificar su motivo, consumidores y pruebas,
actualizar código/configuración/documentación y revisar el resultado como un cambio
común. No se mantiene un estándar distinto por desarrollador. Una excepción local
se justifica por su necesidad y alcance; no crea automáticamente otra convención.

## Fuentes y estado documental

Los criterios funcionales proceden de la [especificación](../requirements/requirements-specification/index.md).
El [mapa de estándares](09-standards-and-ownership.md) identifica las reglas de cada
ámbito; el [plan de pruebas](../testing/01-test-plan.md) define la evidencia. Las referencias
ISO/IEEE orientan el contenido adoptado; no imponen nombres de carpetas ni una
arquitectura Vue concreta. El estado En revisión de la colección expresa su situación
documental; los controles automatizados conservan el comportamiento de su configuración.
