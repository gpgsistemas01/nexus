# 8. Lista de revisión del cambio

1. Confirmar que se consultó la implementación y un flujo equivalente antes de describir
   un patrón nuevo.
2. Enlazar el artefacto propietario y eliminar explicaciones duplicadas.
3. Comprobar que cada nodo y flecha del diagrama tiene evidencia o está marcado como
   propuesta.
4. Revisar que rutas, símbolos, imports, exports, permisos y pruebas citados continúan
   existiendo.
5. Regenerar los inventarios si cambió una fuente derivada y ejecutar
   `npm run docs:check`.
6. Validar el paquete con `npm run docs:export -- arquitectura --check` para detectar
   fuentes o imágenes ausentes.
