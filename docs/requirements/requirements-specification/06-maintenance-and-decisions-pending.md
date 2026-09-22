# 6. Mantenimiento y decisiones pendientes

- El responsable funcional debe validar prioridades y criterios de aceptación; este
  análisis sólo establece la línea base derivada del repositorio.
- Los campos `sku` de `Material` y `SupplierMaterial` permanecen en Prisma por
  compatibilidad del modelo persistente, pero ninguna ruta, DTO, formulario, consulta o
  reporte vigente los utiliza. No forman parte del alcance funcional ni del glosario
  hasta que se defina e implemente un flujo que los capture o presente.
- Al implementar requisiciones o proyectos, primero se debe revisar si el patrón de
  documentos de salida o el CRUD común puede parametrizarse para el nuevo contexto.
- OpenAPI debe mantenerse sincronizado con todas las operaciones registradas y reutilizar
  esquemas compartidos, según la estrategia del contrato API.
- Las metas de rendimiento, disponibilidad, retención de auditoría y respaldo deben
  incorporarse sólo con valores medibles, propietario y mecanismo de comprobación.
