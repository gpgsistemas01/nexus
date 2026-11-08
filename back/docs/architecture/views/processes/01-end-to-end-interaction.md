# Interacción de extremo a extremo

El navegador carga la aplicación Vue. Vue Router resuelve el destino y la sesión;
el transporte del cliente envía las operaciones a Express. La API valida token,
permisos y captura, y el controller delega en el servicio del dominio. El servicio
resuelve estado y pertenencia y ejecuta documento, partidas, stock e historia con
un único contexto transaccional. La respuesta HTTP devuelve datos o un código público.

Una descarga se prepara en el servidor y el cliente libera el Blob después de
entregarlo al usuario. Las notificaciones Socket.IO autorizadas se emiten después
de confirmar las escrituras. La auditoría observa la finalización de la respuesta.

Los detalles temporales pertenecen a las [secuencias backend](backend-code-sequences/index.md)
y a los [procesos Vue](../../../../../front/docs/architecture/views/processes/index.md).
