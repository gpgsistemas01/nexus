# Solicitud HTTP de extremo a extremo

Vue es el consumidor web de la API: envía una operación HTTP con cookies de sesión y
datos de entrada. Express aplica middleware y enruta la solicitud; las validaciones,
la autenticación y la autorización preceden al controller. El controller delega en el
servicio de dominio, que resuelve estado y pertenencia y, para escrituras compuestas,
coordina documento, partidas, stock e historia en una transacción. La API cierra el
recorrido con una respuesta HTTP pública o un error con código.

Las cargas y descargas son operaciones HTTP de la API; en el cliente, una descarga
se recibe como archivo. Las notificaciones Socket.IO se publican después de confirmar
escrituras y no sustituyen la respuesta HTTP. La auditoría observa la finalización
de la respuesta.

Los recorridos exactos se muestran en las [secuencias de la API](backend-code-sequences/index.md).
La coordinación de pantalla y estado cliente se describe en los
[procesos Vue](../../../../../front/docs/architecture/views/processes/index.md).
