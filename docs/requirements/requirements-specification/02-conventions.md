# 2. Convenciones

### 2.1 Identificadores

| Prefijo | Tipo |
| --- | --- |
| `RF` | Requisito funcional observable por un actor o consumidor. |
| `RN` | Regla de negocio que restringe varios flujos. |
| `RD` | Requisito sobre persistencia o representación de datos. |
| `RC` | Requisito de calidad u operación. |
| `CA` | Criterio de aceptación numerado dentro de un requisito cuando se necesitan varios escenarios verificables. |

Un requisito conserva una obligación principal. Si requiere varios ejemplos o
escenarios, se redactan criterios `CA-<ID>-<n>` en lugar de construir una sola oración
con decisiones de interfaz, implementación y excepciones. La evidencia técnica se
mantiene en su columna y no sustituye el resultado observable.

ISO/IEC/IEEE 29148 no obliga a crear una fila independiente para cada verbo CRUD ni
define la numeración concreta de Nexus. Sí orienta a que los requisitos sean singulares,
inequívocos y verificables. El proyecto aplica esos criterios separando operaciones que
pueden autorizarse, fallar y probarse por separado; mantiene juntos únicamente los
atributos y escenarios que describen una misma obligación observable.

Por tanto, no se dejan juntas obligaciones independientes ni se fragmenta cada campo en
un requisito. La singularidad aplica a requisitos funcionales (`RF-*`), de datos
(`RD-*`), reglas de negocio (`RN-*`) y calidad (`RC-*`): se crea otro identificador
cuando cambia el resultado, la restricción, la aprobación o la prueba que decide su
cumplimiento. Los criterios `CA-*` conservan variantes inseparables de una misma
obligación.

### 2.2 Estados

| Estado | Interpretación |
| --- | --- |
| Implementado | Existe un flujo registrado y evidencia suficiente en el código. |
| Parcial | Existe parte del flujo, pero falta una operación, interfaz o evidencia relevante. |
| Modelado | Existen entidades o piezas aisladas, pero no un flujo web/API registrado. |
| Propuesto | Requiere decisión o implementación futura; no debe anunciarse como disponible. |

El estado describe la evidencia del repositorio, no la aprobación del producto por un
usuario responsable. Esa aprobación debe registrarse en la historia o incidencia que
originó el cambio.

### 2.3 Terminología y operaciones

Los requisitos usan los términos canónicos del
[glosario del negocio](../business-glossary.md). El glosario define significado compartido
para usuarios y responsables; el [diccionario técnico](../../generated/data-dictionary.md)
documenta cómo se representan los datos persistentes. Ninguno debe sustituir al otro.

La [matriz de operaciones](../requirements-operations-matrix.md) resume las capacidades
permitidas por módulo y contexto, incluidas las parciales o modeladas. La autorización
efectiva continúa determinada por los permisos del servidor, no por la matriz.
