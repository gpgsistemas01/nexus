# Cómo redactar y revisar requisitos de Vue

Este paquete usa los criterios pertinentes de **ISO/IEC/IEEE 29148:2018** para
requisitos verificables y trazables y **ISO/IEC 25010:2023** para clasificar
atributos de calidad. Es una adaptación local; no declara conformidad. El estándar
documental común está en [aplicación por tipo](../../governance/03-standard-applicability.md).

## Identificadores

| Prefijo | Uso |
| --- | --- |
| `RF` | Capacidad observable del sistema; `RF-VUE-*` identifica el alcance propio del cliente. |
| `RN` | Regla de negocio que condiciona varias operaciones. |
| `RD` | Obligación significativa sobre datos, estado o conservación. |
| `RC` | Restricción de calidad u operación del producto; `RC-VUE-*` aplica al cliente. |
| `CA` | Condición de aceptación subordinada a un requisito. |
| `CU` | Objetivo del actor descrito en una ficha de caso de uso. |

Los IDs son referencias estables y no codifican orden ni prioridad. No se renumera
un requisito por una corrección editorial ni se reutiliza un ID retirado.

## Redacción verificable

Cada requisito expresa una obligación principal, con el actor o componente que la
cumple, la condición y un resultado observable. Distingue la conducta de Vue de la
obligación del servidor: Vue presenta captura, navegación y resultados; Express
autoriza, valida definitivamente y conserva los datos.

```text
Cuando [condición], Vue debe [presentar o permitir la acción] y [resultado observable].
```

Usa términos del [glosario](../business-glossary.md). Evita «correctamente»,
«rápido» o «intuitivo» sin una condición comprobable. No describas nombres de
componentes, composables o archivos como si fueran resultados del usuario; mantenlos
en arquitectura o en la evidencia del requisito.

**Ejemplo:** «Cuando la API rechace una edición por versión desactualizada, Vue debe
conservar la captura y ofrecer volver a consultar el registro vigente antes de otro
intento».

## Ubicación del contenido

| Pregunta | Fuente |
| --- | --- |
| ¿Qué resultado necesita el producto? | Requisito funcional (`RF-*`) en el catálogo. |
| ¿Qué condición de negocio se aplica a varias acciones? | Regla (`RN-*`) compartida. |
| ¿Qué debe conservarse del dato? | Requisito de datos (`RD-*`), sin enumerar todas las columnas del modelo. |
| ¿Cómo recorre el actor la operación y qué pasa si falla? | [Caso de uso](../use-cases/index.md). |
| ¿Qué JSON, ruta o permiso se intercambia? | [Contratos y OpenAPI](../../architecture/contracts/index.md). |
| ¿Qué componente implementa la conducta? | [Arquitectura Vue](../../architecture/index.md). |
| ¿Cómo se comprueba? | [Plan, casos y cobertura de pruebas](../../testing/index.md). |

Los criterios `CA-<ID>-<n>` concretan condiciones que pertenecen a la misma
obligación. Si cambia el actor, permiso, resultado o efecto, crea una obligación
separada o enlaza una regla transversal; no acumules varios resultados distintos
en una frase larga.

## Calidad, evidencia y estado

Para una restricción de calidad, indica el contexto de uso y un resultado medible o
comprobable. Usa ISO/IEC 25010 como vocabulario y acuerda umbrales antes de prometer
rendimiento, disponibilidad o recuperación. Las directrices del equipo sobre código,
pruebas y documentación pertenecen a estándares, arquitectura, pruebas o desarrollo,
no a la SRS del producto.

La tabla de requisitos conserva el estado y evidencia. `Implementado` significa que
el flujo observable está disponible; `Parcial` indica una brecha; `Modelado` indica
piezas sin flujo completo; `Fuera del alcance actual` es una exclusión explícita;
`Propuesto` requiere definición o aprobación. El estado técnico no sustituye la
aceptación funcional. El [mapa de trazabilidad](05-requirement-traceability-rules.md)
relaciona requisitos, casos de uso y cobertura.
