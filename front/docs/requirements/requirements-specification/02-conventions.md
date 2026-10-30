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

Cada requisito expresa una obligación con condiciones y resultado comprobables.
Usa los términos del [glosario](../business-glossary.md); los pasos completos van
en el caso de uso y los detalles de implementación, en Arquitectura.

| Expresión imprecisa | Resultado comprobable |
| --- | --- |
| «Validar correctamente la devolución». | «Rechazar una devolución mayor que el saldo entregado, sin modificar existencias». |
| «Mostrar el duplicado con una alerta». | «Ante una merma duplicada, ofrecer Agregar stock con la captura conservada; abrirlo no registra una entrada». |

Las [reglas editoriales](../../governance/01-documentation-rules.md) y las
[referencias de estándares](../../governance/03-standard-applicability.md)
concentran las pautas de mantenimiento documental.
