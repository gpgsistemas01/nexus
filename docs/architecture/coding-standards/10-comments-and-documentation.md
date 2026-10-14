# 10. Comentarios y documentación

- Un comentario explica una restricción, decisión o consecuencia no evidente; no narra
  la siguiente línea.
- TODOs incluyen una acción concreta y referencia rastreable cuando exista. No se deja
  código comentado como mecanismo de respaldo.
- Funciones privadas claras no requieren JSDoc. Los contratos reutilizables o complejos
  documentan parámetros, retorno y errores sólo cuando el tipo no resulta evidente del
  nombre y uso.
- Un cambio de comportamiento actualiza requisitos, arquitectura o datos en el artefacto
  curado propietario. Cambios en routers, imports entre áreas o Prisma regeneran los
  documentos mediante `npm run docs:architecture`.
- El [índice de arquitectura](../index.md#organización-de-la-documentación-arquitectónica)
  identifica el artefacto propietario; una explicación se agrega allí o enlaza una
  vista existente en lugar de duplicarla.
- La documentación usa los términos canónicos del glosario y enlaza la fuente de verdad
  en lugar de copiar extensamente su contenido.

Los diagramas se contrastan con su fuente normativa o técnica. Usar Mermaid y la
versión configurada por el proyecto; renderizar y revisar una exportación DOCX/PDF
cuando cambie un diagrama o el exportador. `docs:check` verifica los artefactos
generados y OpenAPI, pero no sustituye la revisión semántica ni visual. Los criterios
de publicación se mantienen en la [guía de exportación](../../governance/document-export-guide/index.md).
