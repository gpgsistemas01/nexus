# 9. Errores, seguridad, auditoría y logging

- Se reutilizan `AppError` y los errores de dominio existentes. No se arrojan strings ni
  se responde con una forma de error exclusiva de un endpoint.
- Las reglas de `express-validator` entregan códigos declarados en `errorMap`; no
  incluyen mensajes visibles literales en `withMessage`. Todo código nuevo que deba
  mostrarse se registra también en `public/js/constants/apiMessages.js` para conservar
  una sola traducción de servidor a interfaz.
- Los mensajes para el cliente no exponen stack traces, SQL, credenciales ni detalles
  internos.
- Autenticación y autorización permanecen en middleware y servidor. Ocultar un control
  en la interfaz no sustituye verificar el permiso.
- Contraseñas, tokens, cookies, secretos y datos sensibles no se registran en logs.
- El logger estructurado recibe contexto estable de operación; no se usa `console.log`
  en código de aplicación.
- Una auditoría se registra después de confirmar el efecto que describe o dentro de la
  misma transacción cuando su atomicidad sea parte del contrato.
- Las consultas usan Prisma o parámetros; nunca interpolan entrada del usuario en SQL.

Las notificaciones de inventario se emiten después de completar la operación
correspondiente. Un error posterior al commit no debe presentarse como un rollback
de datos ya confirmados; los contratos y pruebas distinguen ambos resultados.

La auditoría actual posterior a la respuesta no garantiza atomicidad con la escritura.
Si el caso exige esa garantía, su registro debe incorporarse a la transacción; las
limitaciones vigentes se mantienen en [Identidad, acceso y auditoría](../views/logical/02-identity-access-and-audit.md).
