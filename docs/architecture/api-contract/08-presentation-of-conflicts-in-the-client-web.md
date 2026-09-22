# 8. Presentación de conflictos en el cliente web

Las respuestas HTTP `409` conservan un código de error estable en `code` y una
descripción legible en `message`. El cliente muestra ambos valores en el modal de
advertencia: el código identifica el conflicto en el título y el mensaje explica la
causa en el texto normal. Si la respuesta no incluye `code`, el título usa
**Conflicto**; si no incluye `message`, el texto reutiliza el mensaje asociado al
código o el fallback general del manejador de errores.
