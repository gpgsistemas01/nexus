# 8. Vocabulario de requisitos y documentación

Esta referencia define términos documentales. Las operaciones y los registros del
sistema están en el [glosario de negocio](../requirements/business-glossary.md);
la notación, en la [guía de diagramas](../architecture/views/diagram-reading.md).

## Especificación y aceptación

| Término | Significado |
| --- | --- |
| Parte interesada | Persona o grupo con necesidades sobre el producto; puede no usar el sistema. |
| Objetivo de negocio | Resultado de valor que justifica una capacidad. Su cumplimiento requiere indicadores acordados. |
| Alcance vigente | Capacidades y límites incluidos actualmente; una propuesta o un concepto modelado no implica disponibilidad. |
| Supuesto | Condición tomada como base que requiere confirmación. |
| Dependencia | Dato, servicio o condición necesaria para una operación. |
| Restricción | Límite de una solución u operación, con una fuente identificable. |
| Riesgo | Situación posible que afecta un objetivo; se distingue de un incidente ocurrido. |
| SRS | Especificación de requisitos de software: obligaciones, reglas, criterios, estados y trazabilidad. |
| Requisito | Obligación identificada y verificable de la SRS. El código aporta evidencia de implementación. |
| Criterio de aceptación | Condición observable para comprobar un resultado exigido. Las pruebas técnicas no sustituyen la aceptación funcional. |
| Línea base de requisitos | Conjunto versionado y aprobado de requisitos y vocabulario. Un paquete En revisión aún no constituye una línea base aceptada. |

## Objetivos de servicio y recuperación

Sus valores están pendientes de acuerdo; estas definiciones no fijan compromisos.

| Término | Significado |
| --- | --- |
| SLA | Acuerdo de nivel de servicio con medidas y compromisos aceptados. |
| RTO | Tiempo objetivo para recuperar el servicio tras una interrupción. |
| RPO | Pérdida máxima de datos tolerada, expresada como intervalo desde el último punto recuperable hasta la interrupción. |

## Mantenimiento del vocabulario de negocio

Reutilizar términos canónicos; añadir un calificativo cuando cambie el contexto,
como «salida de material» o «salida de merma». El responsable funcional valida
significados nuevos o ambiguos y desarrollo comprueba su correspondencia con el
código.

Cambiar un significado exige revisar requisitos, casos, campos y efectos,
diagramas, contrato API, mensajes y pruebas afectados. Los campos y valores
permitidos se detallan en sus contratos y reglas de captura, sin duplicarlos
en el glosario.
