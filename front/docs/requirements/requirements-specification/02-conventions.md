# 2. Cómo leer los requisitos

## 2.1 Identificadores

| Prefijo | Significado |
| --- | --- |
| `RF` | Función que ofrece el sistema. |
| `RN` | Regla que limita o condiciona una operación. |
| `RD` | Condición sobre los datos y su integridad. |
| `RC` | Condición de calidad u operación. |
| Marca `VUE` | Obligación específica del cliente: interacción, datos o construcción. |
| `CA` | Condición concreta para aceptar un requisito; por ejemplo, `CA-RF-VUE-002-1` pertenece a `RF-VUE-002`. |
| `CU` | Caso de uso que describe los pasos de un objetivo del usuario. |

Los IDs son estables; su número no indica prioridad ni orden de ejecución.

## 2.2 Estados

| Estado | Significado |
| --- | --- |
| Implementado | El flujo existe en el código. |
| Parcial | Falta una parte del flujo o de su comprobación. |
| Modelado | Existen datos o piezas de código, pero no un flujo disponible. |
| Fuera del alcance actual | Capacidad excluida del producto vigente. |
| Propuesto | Necesita acuerdo o implementación futura. |

La [cobertura de pruebas](../../testing/04-use-case-coverage.md) indica qué se ha
comprobado. La aceptación funcional se registra por entrega.

## Calidad de la redacción

Cada requisito tiene una obligación principal, condiciones y resultado comprobables.
Los criterios enumerables se identifican mediante `CA-*`. La redacción utiliza los
términos del [glosario](../business-glossary.md), evita expresiones ambiguas y
mantiene consistencia con permisos, casos y estados. Las medidas de calidad que aún
no se han acordado conservan su estado Propuesto.

Los pasos completos pertenecen al caso de uso; los nombres de archivos y decisiones
de implementación, a Arquitectura. Las relaciones con las funciones y pruebas se
mantienen en [Trazabilidad](05-requirement-traceability-rules.md) y en la cobertura.

| Expresión imprecisa | Resultado comprobable |
| --- | --- |
| «Validar correctamente la devolución». | «Rechazar una devolución mayor que el saldo entregado, sin modificar existencias». |
| «Mostrar el duplicado con una alerta». | «Ante una merma duplicada, ofrecer Agregar stock con la captura conservada; abrirlo no registra una entrada». |

Las [reglas editoriales](../../governance/01-documentation-rules.md) y las
[referencias de estándares](../../governance/03-standard-applicability.md)
concentran las pautas de mantenimiento documental.
