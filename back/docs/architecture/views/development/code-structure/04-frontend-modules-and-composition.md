# 4. Frontend Vue y contratos compartidos

La presentación pertenece a `front/src`: `app` coordina navegación y sesión;
`modules` agrupa capacidades de negocio y `shared` contiene componentes, composables
y transporte reutilizables. Los componentes reciben props y emiten eventos; los
servicios concentran HTTP y los composables coordinan las operaciones.

La [estructura de Vue](../../../../../../front/docs/architecture/views/development/code-structure.md)
y sus [patrones](../../../../../../front/docs/architecture/views/development/design-and-construction-patterns/index.md)
son las fuentes propietarias de composición, tablas, formularios y ciclo de vida.
Los contratos públicos de `back/src/shared` se importan desde Vite. El backend
revalida la captura, autorización y cálculos antes de persistir.
