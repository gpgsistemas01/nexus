# Revisión

Todo cambio de diagrama debe comprobar:

- que no duplica una vista existente con otro nombre;
- que la abstracción coincide con el código actual y no presenta una propuesta como
  implementada;
- que un nuevo contexto reutiliza el patrón CRUD, fábrica o componente aplicable;
- que los requisitos y pruebas CRUD relacionados siguen enlazados en su ubicación
  definida por `service-test-coverage.md`;
- que `npm run docs:check` valida los diagramas generados y la cobertura de los casos
  curados frontend/backend contra el catálogo; la sintaxis y lectura visual de los
  bloques curados se revisan además en la vista previa de Mermaid.
