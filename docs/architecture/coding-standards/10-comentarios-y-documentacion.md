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
- La [guía de documentación técnica](../technical-code-documentation/index.md) decide cuándo la
  explicación permanece junto al código, actualiza una vista Mermaid o enlaza un
  diagrama ya existente.
- La documentación usa los términos canónicos del glosario y enlaza la fuente de verdad
  en lugar de copiar extensamente su contenido.
