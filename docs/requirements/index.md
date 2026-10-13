---
title: Especificación de requisitos de Nexus
document-version: 1.9
system-version: 1.0.0
status: En revisión
---

# Requisitos de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.9 | 1.0.0 | En revisión | 2026-10-13 | Equipo Nexus |

Este es el punto de entrada y la portada del paquete exportable de requisitos. La
[especificación de requisitos](requirements-specification/index.md) conserva la definición
normativa; este índice organiza su lectura sin duplicarla.

## Responsabilidad de cada nivel

Este paquete contiene tres niveles relacionados, pero no intercambiables:

| Nivel | Responsabilidad | Ejemplo de contenido |
| --- | --- | --- |
| [Visión y alcance](vision-scope-and-requirements/index.md) | Explicar la necesidad, los interesados, los límites y las capacidades esperadas sin diseñar la solución. | Objetivo del producto, actores interesados, alcance incluido y excluido. |
| [SRS](requirements-specification/index.md) | Establecer las obligaciones verificables del sistema. Las [fichas de casos de uso](use-cases/index.md) forman parte de esta familia normativa y desarrollan la interacción de los actores. | Requisitos, reglas, atributos de calidad, precondiciones, flujos y postcondiciones. |
| [Arquitectura](../architecture/index.md) | Describir cómo la solución satisface esas obligaciones mediante vistas, decisiones y evidencia técnica. Se publica como documento separado. | Contexto técnico, contenedores, componentes, despliegue, contratos y secuencias internas. |

Los casos de uso no se trasladan ni se duplican en arquitectura. Arquitectura enlaza el
`CU-*` normativo y documenta su realización en las secuencias técnicas y en la matriz de
trazabilidad. De este modo, **visión** dice por qué y hasta dónde, la **SRS** dice qué debe
ocurrir y **arquitectura** explica cómo se construye y ejecuta la solución.

## Orden del paquete

1. [Visión y alcance](vision-scope-and-requirements/index.md).
2. [Especificación de requisitos](requirements-specification/index.md).
3. [Dominio y casos de uso](domain-and-use-cases/index.md).
4. [Descripciones de casos de uso](use-cases/index.md).
5. [Glosario del negocio](business-glossary.md).

Las fichas se subdividen primero por los grupos `AUT`, `IDA`, `CAT`, `ENT` y `SAL`, y
después en un Markdown por cada `CU-*`. Sus índices conservan reglas comunes, resúmenes
y navegación; cada archivo individual contiene únicamente la ficha de su caso. El exportador
ensambla los capítulos en el orden anterior para producir
una entrega normativa completa, pero una revisión focalizada puede abrir sólo el Markdown del
grupo afectado.

La especificación y los casos se conectan con frontend, API, backend y persistencia
mediante la [vista de componentes](../architecture/views/logical/01-components-and-reuse.md)
y las secuencias por `CU-*`; la cobertura se consulta en el
[catálogo por caso de uso](../testing/use-case-test-types.md).
Los diagramas normativos de casos de uso y estados se mantienen en
[dominio y casos de uso](domain-and-use-cases/index.md); las actividades y secuencias de
realización pertenecen a las vistas de procesos y desarrollo de arquitectura.

`scripts/exportDocs.js` conserva este mismo orden al generar el paquete `requisitos`.
Las imágenes que se incorporen a estas secciones pertenecen a
`docs/requirements/images/<sección>/`.

## Control de cambios

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 1.4 | 2026-10-08 | Revisión de visión, glosario y SRS; incorporación de los siete casos de salida de consumibles, referencias y realizaciones; conserva el alcance del sistema 1.0.0 y los IDs anteriores. |
| 1.5 | 2026-10-12 | Movimientos por contexto y peso de merma: captura inicial, consulta posterior y cálculo del reporte; recorrido de negocio consolidado en un diagrama. |
| 1.6 | 2026-10-12 | Criterio de aceptación del peso unitario: límites, precisión y rechazo previo al alta de valores inválidos. |
| 1.7 | 2026-10-12 | Máximo de 100 kg por unidad de merma de Rollo, validación y migración conservando los datos históricos. |
| 1.8 | 2026-10-13 | Peso unitario con hasta tres enteros y dos decimales; rechazo de precisión adicional previo al alta. |
| 1.9 | 2026-10-13 | Cono fijo/variable por material y proveedor, pesos propios de merma, longitud medida o estimada e identidad que distingue pesos; reporte de neto. |
