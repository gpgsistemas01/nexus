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
- Los imports relativos incluyen la extensión `.js`.
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

### 4.4 Ejemplo de contrato entre módulos

El consumidor mantiene el nombre del contrato propietario y pasa dependencias
transaccionales explícitamente:

```js
import { updateMaterialStock } from './materialStockService.js';

export const receiveMaterial = async ({ materialId, quantity, tx }) => {
    return updateMaterialStock({ materialId, quantity, tx });
};
```

No se importa `updateMaterialStock as applyStock`, ni se crea un wrapper llamado
`applyStock` que sólo reenvíe argumentos. Si dos contextos comparten el algoritmo y sólo
cambia el inventario, se extrae una factory parametrizada; no se copian ambos flujos.

Antes de aplicar la excepción se revisa el módulo propietario. Si todos los consumidores
usan el mismo contrato compartido, el export debe adoptar directamente su nombre
canónico. Por ejemplo, los componentes de formularios de documentos reciben la
colección como `details`, por lo que el modal y la página usan ese nombre sin alias:

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

Aquí `details` no es un nombre arbitrario: es el término común utilizado por
`useIssueForm`, `upsertIssueDetail` y la carga enviada al API. La ruta del módulo ya
aporta el contexto de salida de merma, de modo que repetirlo en `wasteIssueDetails`
obligaría a adaptar todos los consumidores sin aportar precisión. El alias queda
reservado para contratos externos o colisiones que el módulo propietario no pueda
resolver sin perjudicar a otros consumidores. La excepción no aplica a controllers y
servicios, cuyos contratos de dominio conservan el nombre exportado según la sección 5.
