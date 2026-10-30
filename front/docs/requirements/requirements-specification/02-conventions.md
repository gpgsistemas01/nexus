# 2. Convenciones

## 2.1 Identificadores

| Prefijo | Tipo |
| --- | --- |
| `RF` | Requisito funcional observable por un actor o consumidor. |
| `RN` | Regla de negocio que restringe varios flujos. |
| `RD` | Requisito sobre persistencia o representación de datos. |
| `RC` | Requisito de calidad u operación. |
| `RF-VUE` / `RD-VUE` | Función o condición de datos específica del cliente. |
| `RN-VUE` | Identificador local de interacción, estado o separación de responsabilidades; no es una regla adicional del negocio. |
| `RC-VUE` | Restricción de tecnología, construcción o despliegue del cliente. |
| `CA` | Criterio de aceptación numerado dentro de un requisito cuando se necesitan varios escenarios verificables. |

Cada requisito expresa una obligación principal. Sus variantes se concretan con
criterios `CA-<ID>-<n>`. Una obligación que puede aprobarse o rechazarse de forma
independiente necesita una definición propia; un campo o ejemplo no necesita otro
ID sólo por aparecer en una pantalla. La numeración es una convención de Nexus.

### Calidad de la redacción

| Comprobar | Forma de aplicarlo |
| --- | --- |
| Necesidad y alcance | Identificar el actor o consumidor, el resultado y la capacidad de la que forma parte. |
| Claridad | Usar los términos del glosario y condiciones concretas; evitar «adecuado», «rápido» o «cuando corresponda» sin una regla enlazada. |
| Una obligación principal | Separar objetivos con permisos o resultados independientes. Los requisitos por familia del cliente enlazan su detalle funcional del catálogo. |
| Verificación | Indicar la condición, el resultado aceptado y el rechazo relevante. Las cantidades, estados y límites deben poder comprobarse. |
| Viabilidad y acuerdos | Distinguir lo implementado de lo propuesto. Mantener metas y responsables aún no acordados en el registro de pendientes. |
| Consistencia y trazabilidad | Definir cada ID una sola vez y enlazar reglas comunes, casos y evidencia. Los IDs históricos equivalentes conservan una definición canónica identificada. |
| Separación del diseño | Expresar qué debe ocurrir. Bibliotecas, componentes y algoritmos van en arquitectura, salvo una restricción técnica explícita de datos u operación. |

Ejemplos de redacción:

| Evitar | Enunciado comprobable |
| --- | --- |
| «Validar correctamente la devolución». | «Rechazar una devolución mayor que la cantidad entregada menos las devoluciones anteriores, sin modificar existencias». |
| «Mostrar el duplicado con Swal». | «Ante una merma duplicada, ofrecer abrir Agregar stock con la cantidad y observaciones capturadas; abrirlo no registra una entrada». |
| «Los listados deben ser rápidos». | Definir carga, medida y umbral antes de aceptar un objetivo de rendimiento; la necesidad permanece propuesta mientras falte ese acuerdo. |

La [aplicabilidad de estándares](../../governance/03-standard-applicability.md)
identifica la referencia ISO/IEC/IEEE 29148 y su alcance en este proyecto.

## 2.2 Estados

| Estado | Interpretación |
| --- | --- |
| Implementado | Existe un flujo registrado y evidencia suficiente en el código. |
| Parcial | Existe parte del flujo, pero falta una operación, interfaz o evidencia relevante. |
| Modelado | Existen entidades o piezas aisladas, pero no un flujo web/API registrado. |
| Fuera del alcance actual | Capacidad excluida del producto vigente; requiere un nuevo acuerdo de alcance. |
| Propuesto | Requiere decisión o implementación futura; no debe anunciarse como disponible. |

El estado describe la evidencia del repositorio, no la aprobación del producto por un
usuario responsable. Esa aprobación debe registrarse en la historia o incidencia que
originó el cambio.

## 2.3 Lectura y aceptación entre partes interesadas

El responsable funcional revisa la necesidad, el actor, las reglas y el resultado observable. Desarrollo y pruebas revisan factibilidad y evidencia; el estado técnico no sustituye la decisión de aceptación. La [gobernanza documental](../../governance/01-documentation-rules.md) define dónde registrar esa decisión y sus pendientes.

Por ejemplo, para una recepción: **dado** un proveedor y artículos válidos, **cuando** Almacén confirme lo recibido, **Nexus debe** registrar el folio e incrementar la existencia de esos artículos; si la operación falla, no debe quedar una recepción parcial. El negocio puede revisar esa garantía sin conocer nombres de tablas ni rutas HTTP.

## 2.4 Terminología y operaciones

Los requisitos usan los términos canónicos del
[glosario del negocio](../business-glossary.md). El glosario define significado compartido
para usuarios y responsables; los [contratos del cliente](../../architecture/contracts/client-contracts.md)
documentan la representación intercambiada con la API. Ninguno debe sustituir al otro.

Los [modos, precondiciones y efectos](06-operation-modes-and-effects.md) conservan el
contrato funcional de las operaciones. La composición técnica se consulta en el
[diagrama de componentes](../../architecture/views/logical/components/index.md),
los métodos y rutas en [contrato HTTP del cliente](../../architecture/contracts/client-contracts.md) y la
autorización efectiva en la política del servidor.

## 2.5 Condiciones y comprobación

La obligación y sus criterios expresan resultados del negocio. Los nombres de rutas,
modelos, campos y herramientas se conservan en la evidencia, salvo que constituyan una
restricción técnica explícita de datos, seguridad u operación. No se eliminan esas
restricciones de `RD-*` o `RC-*` para hacerlas parecer funciones de un actor.

Cada criterio `CA-<ID>-<n>` pertenece al requisito indicado y conserva numeración local.
Las condiciones transversales se enlazan mediante `RN-*`, sin copiar su definición.
Una operación rechazada conserva los datos e inventario anteriores y no deja cambios
parciales; una consulta o reporte no modifica los datos consultados.

Los IDs son referencias estables, no pasos de un flujo. El orden de interacción se lee
en las fichas de casos de uso; corregir redacción o alcance no renumera requisitos ni
asigna un ID existente a una capacidad distinta.

## 2.6 Atributos y mantenimiento

| Información del requisito | Ubicación y regla de lectura |
| --- | --- |
| Identidad, obligación y criterios | Fila normativa de catálogo o especificación Vue y sus criterios `CA-*`. Los enunciados enlazados desde otros capítulos no son nuevas definiciones. |
| Necesidad y alcance | Visión, actores y reglas relacionadas explican el contexto. Una fuente de código identifica realización; no acredita por sí sola el origen o la aprobación de la necesidad. |
| Prioridad | La entrega o incidencia registra qué obligaciones y escenarios se incluyen y su orden acordado. El número del ID y el estado Implementado no expresan prioridad. Las capacidades modeladas o excluidas requieren decisión de alcance antes de incorporarse. |
| Dependencias y restricciones | Las reglas de trazabilidad y las interfaces identifican condiciones compartidas, datos previos y responsabilidades. |
| Estado y aceptación | El catálogo registra disponibilidad del producto; la aceptación funcional registra una decisión separada con su responsable y evidencia. |
| Verificación | Casos relacionados, criterios y forma de comprobación del capítulo 8. DP/CP describen pruebas; EP registra la ejecución y su resultado. |
| Versión y cambios | Control documental de la colección e historia de Git, vinculados a la revisión de alcance o defecto. Una obligación modificada conserva su ID cuando mantiene el mismo propósito. |

Los responsables de aprobación y objetivos aún no acordados se concentran en
[decisiones pendientes](../vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md).
No se completa esa información asignando prioridades, firmas o umbrales ficticios.
