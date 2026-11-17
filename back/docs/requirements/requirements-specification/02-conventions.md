# Cómo redactar y revisar requisitos

La SRS define resultados y restricciones que Nexus debe cumplir. Usa de forma
selectiva los criterios de **ISO/IEC/IEEE 29148:2018** para calidad de requisitos
y **ISO/IEC 25010:2023** como vocabulario para atributos de calidad; esta guía
local no declara conformidad con esas normas. El alcance de cada referencia está
en [estándares documentales](../../governance/documentation-standards/03-application-by-type-of-document.md).

## Identificadores y fuentes

| Prefijo | Uso |
| --- | --- |
| `RF` | Capacidad o respuesta observable de Nexus. |
| `RN` | Regla de negocio aplicable a una o más operaciones. |
| `RD` | Condición de información, relación, conservación o integridad de datos. |
| `RC` | Restricción de calidad, seguridad, compatibilidad u operación del producto. |
| `CA` | Criterio verificable que concreta una variante o condición de un requisito. |
| `CU` | Objetivo de actor cuyo recorrido se describe en un caso de uso. |

Los identificadores son estables y no expresan prioridad. Se conserva el ID cuando
se aclara su redacción; un ID retirado no se asigna a otra obligación. La fila de
requisito identifica el ámbito y la fuente propietaria; la evidencia enlaza código,
contrato o prueba, pero no reemplaza la obligación.

## Forma de un requisito

Cada fila debe expresar **una obligación** y poder revisarse sin interpretar la
arquitectura. Usa actor o sistema, condición relevante, obligación y resultado
observable. Para restricciones de calidad, especifica el contexto de uso y la
condición que se pueda medir o comprobar.

```text
Cuando [condición], [actor o Nexus] debe [acción/obligación] y [resultado observable].
```

Usa términos del [glosario del negocio](../business-glossary.md). Evita palabras
indeterminadas como «correctamente», «rápido», «seguro» o «intuitivo» sin un criterio
que permita decidir si se cumple. Distingue entre la obligación y lo que hoy hace
el software: el estado de implementación va en su columna.

**Ejemplo verificable:** «Cuando el stock contado sea cero, Nexus debe aceptar el
ajuste autorizado, registrar motivo y diferencia, y dejar la existencia en cero».
La prueba puede observar permiso, respuesta, movimiento y saldo persistido.

**No es una obligación del producto:** «El servicio debe reutilizar la factory
CRUD». Es una convención interna y pertenece a arquitectura/codificación; las
decisiones de prueba pertenecen al plan de pruebas y los comandos de validación,
a desarrollo.

## Separación de contenido

| Contenido | Ubicación |
| --- | --- |
| Necesidad, actores y límites del producto | [Visión y alcance](../vision-scope-and-requirements/index.md). |
| Obligación, regla, condición de datos o calidad | Catálogo de esta SRS. |
| Pasos, alternativas, excepciones y garantías del actor | [Casos de uso](../use-cases/index.md). |
| Rutas HTTP, parámetros y respuestas | [OpenAPI](../../architecture/openapi/index.md). |
| Módulos, clases, tablas, bibliotecas y realización técnica | [Arquitectura](../../architecture/index.md). |
| Cobertura y método de comprobación | [Plan y cobertura de pruebas](../../testing/test-plan.md). |

Incluye un nombre técnico dentro de la obligación sólo cuando sea una restricción
de compatibilidad, seguridad, interfaz o despliegue que el producto deba mantener.
En los demás casos, deja los nombres de rutas, archivos, modelos y pruebas en la
columna de evidencia o en el documento propietario.

## Criterios de aceptación y trazabilidad

Añade `CA-<ID>-<n>` cuando una condición concreta no cabe claramente en la oración
principal o cuando varias variantes verificables comparten una obligación. Cada
criterio conserva el requisito padre y declara condición y resultado; no crea otro
flujo de usuario ni repite una regla transversal. Una variante con autorización,
resultado o efecto independiente suele requerir otro requisito.

Relaciona cada obligación con las reglas transversales y los `CU-*` afectados en
la [matriz de trazabilidad](05-requirement-traceability-rules.md). Los casos de uso
explican los pasos; los requisitos relacionados no se duplican como texto.

## Reglas de negocio y calidad

- Una `RN-*` se usa sólo para una regla del dominio compartida por operaciones; las
  reglas de una sola acción permanecen en su `RF-*` o caso de uso.
- Una `RD-*` declara una obligación de información significativa para el negocio,
  no cada columna del esquema Prisma.
- Una `RC-*` selecciona una característica de calidad relevante para Nexus y la
  concreta con escenario, medida, umbral o resultado comprobable. Usa ISO/IEC 25010
  como clasificación, no como lista de promesas automáticas.
- Si la organización aún no ha acordado medida, umbral, carga, responsable o
  infraestructura para rendimiento, disponibilidad o recuperación, registra la
  necesidad como `Propuesto`; no la marques implementada por la sola presencia de
  código o pruebas.
- Las directrices de desarrollo, convenciones de código, obligatoriedad de pruebas
  y mantenimiento documental se mantienen en sus documentos de gobierno, arquitectura
  y pruebas; no se presentan como necesidades del actor o requisitos del producto.

## Estado, evidencia y aceptación

| Estado | Significado |
| --- | --- |
| Implementado | El alcance descrito está presente en una ruta disponible y hay evidencia técnica pertinente. |
| Parcial | Sólo una parte del resultado está disponible o falta una condición relevante. |
| Modelado | Hay datos o piezas internas, pero no un flujo disponible que cumpla la obligación. |
| Fuera del alcance actual | La capacidad está explícitamente excluida del producto vigente. |
| Propuesto | La necesidad o sus criterios requieren definición o aprobación antes de tratarse como compromiso vigente. |

El estado resume la implementación observada; no equivale a aprobación funcional.
La aceptación corresponde a las partes interesadas y se registra por el proceso de
[cambio y versionado](../../governance/documentation-standards/06-responsibilities-and-change-control.md).
