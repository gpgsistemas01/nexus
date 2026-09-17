---
title: Especificación de requisitos de Nexus
document-version: 1.1
system-version: 1.0.0
status: En revisión
---

# Requisitos de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.1 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

Este es el punto de entrada y la portada del paquete exportable de requisitos. La
[especificación de requisitos](requirements-specification/index.md) conserva la definición
normativa; este índice organiza su lectura sin duplicarla.

## Orden del paquete

1. [Visión, alcance y requisitos](vision-scope-and-requirements.md).
2. [Especificación de requisitos](requirements-specification/index.md).
3. [Dominio y casos de uso](domain-and-use-cases.md).
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
