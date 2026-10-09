# Organización e integración del código

Esta colección sigue siendo la entrada general de la vista de desarrollo. Describe
la distribución del repositorio, el registro HTTP, las fronteras entre servidor y
navegador y la integración con Prisma. La carpeta técnica `code-structure` conserva
su ubicación; su alcance es el conjunto del software.

Los archivos, imports y particularidades de cada recurso pertenecen a las referencias
técnicas de [backend](../backend-technical-documentation/02-module-code-maps.md) y
[frontend](../frontend-technical-documentation/02-module-code-maps.md). Las decisiones
que se repiten entre recursos se justifican en [patrones](../design-and-construction-patterns/index.md),
y los contratos de sus núcleos se detallan en [reutilización](../reuse-and-refactoring/index.md).
Los mapas generales se amplían mediante enlaces, sin reproducir aquí cada módulo.

## Capítulos

1. [Repositorio y distribución de fuentes](01-repository-and-source-layout.md).
2. [Entradas HTTP y registro de routers](02-http-entry-points.md).
3. [Backend: dominios y dependencias](03-backend-domains-and-dependencies.md).
4. [Frontend: plantillas, módulos y composición](04-frontend-modules-and-composition.md).
5. [Contratos entre capas](05-cross-layer-contracts.md).
6. [Prisma: cliente, consultas, transacciones y migraciones](06-prisma-and-persistence.md).
7. [Lista de revisión del código y sus diagramas](07-review-checklist.md).

Cada flecha de un mapa declara **uso, import o configuración**; no representa orden
temporal. Un subgrafo agrupa archivos del repositorio y no supone un servicio desplegado
por separado. Los mapas son proyecciones de módulos ES en Mermaid `flowchart`, no
diagramas UML de clases: las funciones exportadas no se representan como objetos con
herencia. Las secuencias tienen llamadas numeradas y retornos y pertenecen a
[procesos](../../processes/index.md) cuando explican una operación completa.

La [reutilización y refactorización](../reuse-and-refactoring/index.md) explica los
contratos compartidos; [patrones](../design-and-construction-patterns/index.md) explica
la decisión de diseño. El [mapa generado](../code-map.md) conserva el inventario de
rutas e imports. Las figuras curadas se revisan al cambiar sus módulos y no se generan
automáticamente a partir de decisiones supuestas.
