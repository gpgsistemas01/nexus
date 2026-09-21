# 4. Mantenimiento

Al agregar, renombrar o retirar una vista web:

1. Actualizar el mapa de navegación y el catálogo de este documento.
2. Regenerar el catálogo de rutas; no copiarlo al `README.md`.
3. Verificar que ruta, permiso, controlador, plantilla y JavaScript de página conserven
   nombres coherentes.
4. Si cambia un límite del sistema o una dependencia externa, actualizar también los
   diagramas de contexto y contenedores.
5. Revisar los diagramas en la vista previa de Markdown de GitHub antes de fusionar.
6. Ejecutar `npm run docs:architecture` cuando cambien routers o imports entre áreas y
   confirmar con `npm run docs:check` antes de enviar el cambio. La misma verificación
   se ejecuta automáticamente en CI para pull requests y pushes a la rama principal.

Los diagramas describen el diseño a nivel de sistema; el código sigue siendo la fuente
de verdad para los detalles de endpoints, payloads y reglas de autorización. Las vistas
nuevas deben seguir las [convenciones y patrones para diagramas](../diagram-conventions/index.md),
incluida la distinción entre notación visual, patrón documental y patrón con evidencia
en el código.
