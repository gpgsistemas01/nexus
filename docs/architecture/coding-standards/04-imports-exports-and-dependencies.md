# 4. Imports, exports y dependencias

### 4.1 Imports

- Todos los imports estáticos se colocan al inicio del módulo.
- Se agrupan, en este orden, dependencias externas, configuración o constantes,
  componentes de la misma capa y utilidades. Se usa una línea vacía sólo cuando separar
  grupos mejora claramente la lectura.
- Dentro de un grupo, se conserva un orden estable por dominio y nombre; no se ordena
  según el momento en que se añadió una dependencia.
- Un import nombrado corto permanece en una línea. Si necesita dividirse, cada símbolo
  ocupa su propia línea y la llave de cierre se alinea con `import`.
- Los imports relativos de JavaScript incluyen `.js`. Para un artefacto generado se
  respeta su extensión real, como el cliente Prisma `.ts` importado por `src/lib/prisma.js`.
- Se importa desde el módulo propietario. No se atraviesa un barril o wrapper que sólo
  reexporta símbolos para ocultar la dependencia real.
- No se usan imports dinámicos para evitar un ciclo o esconder una dependencia; primero
  se corrige la frontera entre módulos. Son válidos cuando la carga diferida forma parte
  del comportamiento.
- Nunca se envuelve un import en `try/catch`.
- No permanecen imports duplicados, sin uso ni exclusivos de código comentado.

### 4.2 Exports

- Se prefieren exports nombrados para capacidades de dominio, de modo que el consumidor
  declare exactamente qué usa.
- El export default se reserva para contratos que la infraestructura consume como una
  sola instancia, por ejemplo un router Express.
- Un módulo no exporta helpers privados sólo para probarlos. Se prueba su efecto mediante
  la capacidad pública; si contienen una regla reutilizable, se extraen a un módulo con
  responsabilidad propia.
- Imports, exports, rutas, consumidores, pruebas y referencias documentales se actualizan
  en el mismo cambio.
- No se renombra un export al importarlo sólo por preferencia del consumidor. Se admite
  un alias cuando el módulo se integra con un flujo compartido cuyo contrato canónico
  exige otro nombre, o cuando resuelve una colisión real. El alias debe conservar el
  término del contrato de destino y hacer explícita la adaptación en el import; no debe
  ocultar diferencias de reglas, permisos o persistencia.

### 4.3 Límites entre capas

- Controllers traducen HTTP y delegan reglas a servicios; no implementan persistencia.
- Servicios coordinan reglas y transacciones; no conocen `req`, `res`, DOM ni detalles
  visuales.
- Repositories encapsulan consultas reutilizables y reciben el cliente transaccional
  cuando corresponde.
- DTOs aceptan únicamente campos permitidos y normalizan el contrato de entrada o salida.
- Validators rechazan forma y límites de entrada sin duplicar decisiones transaccionales.
  Una regla específica de un formulario permanece privada en `validators/forms`; sólo
  los validadores de campo independientes del recurso se exportan desde `validators/fields`.
- Módulos de `application` coordinan casos de uso del navegador; `pages` componen y
  registran el contexto; `ui` y `views/shared` contienen presentación reutilizable.
- Antes de agregar un proceso se revisan factories, componentes y flujos equivalentes.
  Si sólo cambia material por merma u otro contexto, se parametriza el proceso común y
  se mantienen separadas únicamente reglas, permisos, persistencia o lenguaje propios.

### 4.4 Nombres y contratos compartidos

Mantener el nombre exportado por el módulo propietario. Un alias se reserva para una
colisión real o una adaptación a un contrato compartido, conforme a la sección 4.2;
los controllers y servicios siguen además la sección 5.

Cuando todos los consumidores usan un contrato común, definir su nombre canónico en
el propietario. Por ejemplo, los formularios de documentos usan `details`:

```js
// wasteIssueModal.js
export const details = [];

// wasteIssueForm.js
import { details, wasteIssueHeaderForm } from './wasteIssueModal.js';

upsertIssueDetail({
    details,
    detail: waste,
    matches: item => item.wasteId === waste.wasteId
});
```

Un wrapper que sólo reenvía argumentos no aporta una capa. Una fachada que fija el
contexto de inventario o aplica una política sí tiene responsabilidad propia: evita
que el cliente determine un discriminador persistido y reutiliza el núcleo común.
