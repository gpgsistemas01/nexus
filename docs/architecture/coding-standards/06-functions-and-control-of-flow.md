# 6. Funciones y control de flujo

- Cada función conserva una responsabilidad y un nivel de abstracción reconocible.
- Se prefieren retornos tempranos para errores, guardas y casos sin trabajo. El recorrido
  normal conserva la menor anidación posible.
- No se extrae un wrapper que sólo renombra o reenvía una llamada sin adaptar contrato,
  contexto o política.
- Los parámetros relacionados se agrupan en un objeto cuando evita una firma posicional
  ambigua. Las propiedades requeridas permanecen explícitas en el punto de llamada.
- No se muta un argumento salvo que el contrato lo indique, como un acumulador o cliente
  transaccional. Los adaptadores de respuestas crean objetos nuevos.
- Se usa `const` por defecto y `let` sólo cuando existe una reasignación necesaria. No se
  usa `var`.
- `async` se usa sólo cuando la función espera una promesa o forma parte de un contrato
  asíncrono. Las promesas se esperan o retornan; no se dejan flotantes.
- Las operaciones independientes pueden ejecutarse juntas sólo si no alteran el orden,
  transacción, carga o manejo de errores requerido.
- Un `catch` agrega contexto, traduce a un error de dominio o compensa una operación; no
  captura para ignorar el fallo.
- Una escritura compuesta usa la transacción y propaga `tx` a todas sus colaboraciones.
  No mezcla el cliente global con el transaccional dentro del mismo cambio.
