# 1. Propósito y alcance

Esta guía define **dónde** registrar la explicación técnica de una implementación,
**cómo** identificar archivos y funciones y **cuándo** incluir un diagrama o enlazar
una vista existente. Está dirigida a quienes
mantienen rutas, controladores, DTO, servicios, componentes de interfaz, persistencia y
pruebas. No sustituye los comentarios puntuales del código ni crea un documento por cada
módulo: conecta cada cambio con la fuente de verdad que ya existe.

El detalle técnico se conserva junto al repositorio porque debe evolucionar en la misma
solicitud de cambio que la implementación. Markdown y Mermaid son las fuentes
versionadas; no se adjuntan diagramas editables o imágenes cuando la misma vista puede
mantenerse como texto revisable.

Además de las reglas de mantenimiento, esta entrada separa las referencias concretas de
backend y frontend. Cada una usa un flujo implementado como ejemplo y conserva enlaces
hacia el contrato compartido, sin convertirlo en una plantilla que deba copiarse a todos
los dominios.
