---
title: Especificación de requisitos de Nexus
document-version: 1.2
system-version: 1.0.0
status: En revisión
---

# Requisitos de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.2 | 1.0.0 | En revisión | 2026-09-17 | Equipo Nexus |

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
5. [Diagramas de requisitos](diagrams/index.md).
6. [Matriz de requisitos y operaciones](requirements-operations-matrix.md).
7. [Glosario del negocio](business-glossary.md).

Las fichas y los diagramas se subdividen primero por los grupos `AUT`, `IDA`, `CAT`, `ENT` y
`SAL`, y después en un Markdown por cada `CU-*`. Sus índices conservan reglas comunes, resúmenes
y navegación; cada archivo individual contiene únicamente la ficha o el diagrama de su caso. El exportador
ensambla los capítulos en el orden anterior para producir
una entrega normativa completa, pero una revisión focalizada puede abrir sólo el Markdown del
grupo afectado.

La especificación y los casos se conectan con frontend, API, backend, persistencia y
pruebas mediante la [matriz de trazabilidad técnica](../architecture/traceability-matrix/index.md);
el [inventario de diagramas](../architecture/diagram-inventory/index.md) asigna identificadores
estables a todas sus vistas.

`scripts/exportDocs.js` conserva este mismo orden al generar el paquete `requisitos`.
Las imágenes que se incorporen a estas secciones pertenecen a
`docs/requirements/images/<sección>/`.
