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
- Todo JavaScript entregado al navegador, incluido `/shared`, es público y el usuario
  puede modificar su copia. La seguridad de una escritura debe mantenerse ante una
  solicitud directa que omita el formulario o altere sus campos.
- El servidor calcula los importes y demás resultados derivados que guarda a partir
  de entradas validadas y datos autorizados. Los DTOs y servicios descartan o rechazan
  los resultados que el cliente intente imponer, conforme al contrato del recurso.
  Un costo de compra capturado por un operador autorizado es una entrada del proceso;
  el impuesto y el total derivados de ese costo se calculan en el servidor.
- Distinguir confidencialidad e integridad: fórmulas generales usadas para una vista
  previa pueden ser públicas; fórmulas propietarias clasificadas como confidenciales
  se ejecutan exclusivamente en el backend. Minificar, ofuscar o renombrar un archivo
  no convierte en privado el código entregado al navegador.
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

Estas reglas siguen las recomendaciones de
[OWASP sobre lógica de negocio](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html#always-re-derive-security-relevant-values-server-side),
[protección del frontend](https://cheatsheetseries.owasp.org/cheatsheets/Web_Frontend_Security_Cheat_Sheet.html#never-transmit-secrets-to-the-client)
y [CWE-602](https://cwe.mitre.org/data/definitions/602.html).
