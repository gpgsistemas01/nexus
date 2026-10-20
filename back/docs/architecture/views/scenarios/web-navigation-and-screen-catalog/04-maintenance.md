# 4. Mantenimiento

Al agregar, renombrar o retirar una vista web:

1. Actualizar el mapa de navegación y el catálogo de este documento.
2. Regenerar el catálogo de rutas; no copiarlo al `README.md`.
3. Verificar que ruta, permiso, controlador, plantilla y JavaScript de página conserven
   nombres coherentes.
4. Si cambia un límite del sistema o una dependencia externa, actualizar también los
   diagramas de contexto y contenedores.
5. Renderizar los diagramas con la versión de Mermaid configurada por el proyecto y
   comprobar una exportación DOCX/PDF representativa antes de fusionar; los casos de
   uso requieren Mermaid 12 y no se validan sólo con la vista previa de GitHub.
6. Ejecutar `npm run docs:architecture` cuando cambien routers o imports entre áreas y
   confirmar con `npm run docs:check` antes de enviar el cambio. La misma verificación
   se ejecuta automáticamente en CI para pull requests y pushes a `features`; la
   regeneración y el commit automáticos quedan restringidos al push a `main`.

Los diagramas describen el diseño a nivel de sistema; el código sigue siendo la fuente
de verdad para los detalles de endpoints, payloads y reglas de autorización. Las vistas
nuevas deben declarar su alcance, semántica y fuente de verdad junto al diagrama; no se
duplica su ubicación en un inventario separado.

Cuando cambia un caso de uso, revisar también la trazabilidad de escenarios, el
catálogo de pantallas, los permisos y el manual del actor, aunque no se agregue una
URL. `docs:check` comprueba artefactos generados y OpenAPI; no sustituye la revisión
semántica de los escenarios y estados curados. La fuente normativa de los estados
de negocio permanece en requisitos y se enlaza desde esta vista.
