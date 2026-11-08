# 10. Publicación de eventos de inventario

`emitInventoryUpdated`, en `src/utils/socketUtils.js`, publica después de confirmar
la escritura. El payload conserva contexto, origen y fecha de actualización. Antes
de emitir, revalida la cuenta y los permisos de cada conexión; una identidad inválida
se desconecta. Un fallo de notificación no revierte una transacción ya confirmada.

Los consumidores de Socket.IO se autentican con las cookies y el origen configurado.
La consulta y recarga de tablas Vue pertenecen al cliente y a su transporte HTTP.
La API continúa siendo la autoridad de stock, cálculos y permisos.
