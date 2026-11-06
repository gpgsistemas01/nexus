# 4. Reglas, recomendaciones y criterios de aceptación

Esta guía distingue resultados exigidos, convenciones del equipo y decisiones que
admiten alternativas.

## Tipos de enunciado

| Tipo | Significado y ejemplo | Fuente |
| --- | --- | --- |
| Requisito o criterio de aceptación | Resultado exigido: una devolución positiva no supera el saldo disponible. | Especificación, CU y pruebas de la regla. |
| Regla de construcción | Convención compartida: la presentación no realiza HTTP ni modifica props. | Estándar y revisión del código. |
| Formato automatizado | Estilo fijado: cuatro espacios en SFC y comillas simples. | EditorConfig, Prettier y ESLint. |
| Recomendación | Orientación con alternativas: extraer un helper con responsabilidad y consumidores reales. | Contexto y revisión del cambio. |
| Decisión de diseño | Solución implementada y motivo: sesión por aplicación mediante provide/inject. | Código y decisiones arquitectónicas. |
| Resultado de ejecución | Evidencia de una corrida concreta: prueba de devolución aprobada o fallida. | EP, comando, entorno y artefactos. |

## Cómo leer el lenguaje

«Debe», «requiere» y las prohibiciones expresan obligaciones con su fuente.
«Se recomienda» y «preferir» admiten alternativas. «El código utiliza» describe la
implementación actual.

Un criterio tiene condición y resultado observable: «con saldo leído 2, capturar
devolución 3 muestra error y no envía la solicitud». Esa prueba del formulario no
demuestra por sí sola el saldo persistido.

## Decisiones individuales y cambios compartidos

Cada desarrollador elige nombres locales, descomposición y algoritmo dentro del
contrato y el estándar. Explica elecciones que introducen dependencias o costos
relevantes. Una excepción local registra necesidad y alcance.

Cambiar una regla compartida exige revisar consumidores y pruebas, actualizar
código, configuración y documentación, y someter el resultado a revisión. Las
fuentes de cada regla están en el [mapa de estándares](09-standards-and-ownership.md).
