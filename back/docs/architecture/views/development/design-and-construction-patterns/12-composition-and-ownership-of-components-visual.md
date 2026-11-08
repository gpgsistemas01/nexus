# 12. Composición y propiedad de componentes visuales

Los componentes visuales pertenecen a Vue. `front/src/shared/components` concentra
los marcos, tablas, diálogos y controles transversales; cada dominio conserva las
variantes que sólo consume su flujo. Las páginas coordinan estado y operaciones;
los componentes reciben props y emiten eventos.

Las decisiones y sus diagramas se mantienen en [slots y composición visual](../../../../../../front/docs/architecture/views/development/design-and-construction-patterns/05-slots-and-visual-composition.md)
y [responsabilidades de documentos](../../../../../../front/docs/architecture/views/development/design-and-construction-patterns/08-document-responsibilities.md).
La autorización y los efectos de persistencia se comprueban en la API.
