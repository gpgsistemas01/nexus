# 7. Factories y composición por contexto

Los handlers HTTP compartidos de compras y salidas se configuran con las fachadas
de materiales y consumibles. Cada fachada fija el tipo en el servidor y delega en
el núcleo transaccional. La configuración conserva URLs, permisos y mensajes del
recurso sin duplicar reglas de persistencia.

Las factories de DTOs y políticas se mantienen en sus áreas propietarias. Una nueva
variante reutiliza el núcleo existente, registra su router en `src/routes/api/index.js`
y demuestra su autorización y separación mediante HTTP/Prisma.

La composición del cliente pertenece a los [patrones Vue](../../../../../../front/docs/architecture/views/development/design-and-construction-patterns/index.md).
