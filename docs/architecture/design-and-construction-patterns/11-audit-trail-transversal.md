# 7. Audit Trail transversal

`auditWrites` implementa el patrón **Audit Trail** como middleware transversal. Filtra
`POST`, `PUT`, `PATCH` y `DELETE` bajo `/api`, espera el evento `finish`, descarta
respuestas fallidas o sin actor y delega a `persistWriteAudit`. El servicio deriva
acción, recurso e identidad, limita longitudes y elimina contraseña, token, secreto,
autorización y cookie antes de persistir `CriticalWriteAudit`.

Es auditoría de responsabilidad (*accountability*) y no Event Sourcing ni log de
dominio. Actualmente es **best effort y posterior al commit**: una falla se registra en
el logger pero no revierte la escritura. La brecha debe resolverse sólo si un requisito
exige garantía atómica o entrega durable; en ese caso se recomienda **Transactional
Outbox** o incluir un registro de auditoría específico en la misma transacción, no
convertir todos los agregados a Event Sourcing. También faltan pruebas dedicadas del
sanitizado, clasificación y política de fallo, brecha registrada en el plan de pruebas.
