# 5. Convenciones de controladores y rutas

Los controladores importan cada función con el nombre exportado por el módulo de origen.
No se usan alias para adaptar un servicio al contexto del controlador, porque ocultan el
contrato entre capas y dificultan encontrar sus usos.

```js
// Recomendado
import { findAllWastes } from '../../../services/warehouse/wasteService.js';

// Evitar
import { findAllWastes as findAllWasteItems } from '../../../services/warehouse/wasteService.js';
```

Las funciones exportadas por `*Controller.js` no llevan el sufijo `Controller`: el
archivo ya expresa esa responsabilidad. El nombre empieza con la acción HTTP y termina
con el recurso completo, siguiendo los verbos CRUD `get`, `register`, `edit` o `remove`.

- Las colecciones API usan plural: `getAllWasteIssues`.
- Una operación sobre subrecurso explicita documento y subrecurso:
  `registerWasteIssueDetailReturn`.
- El servicio conserva el verbo del dominio, por ejemplo `returnWasteIssueDetail`; así
  controlador y servicio se distinguen sin alias.
- Cuando los contratos podrían colisionar, ambos reciben nombres descriptivos. Por
  ejemplo, `registerGoodsIssueDetailReturn` crea el recurso HTTP y
  `returnGoodsIssueDetail` ejecuta la operación de dominio.
- Los controladores web que renderizan colecciones siguen
  `get<RecursosEnPlural>Page`: `getClientsPage`, `getPersonsPage` y
  `getSuppliersPage`.
- Las rutas importan y registran el nombre del controlador sin renombrarlo.
- Los handlers del router se ordenan como lectura/listado, creación, actualización
  general, actualizaciones especializadas y eliminación o acción terminal.

Un controller usa `return res...` para hacer explícito el final de la respuesta. El
código de estado corresponde al resultado HTTP y los errores se entregan al mecanismo
central existente; no se construye un formato de error paralelo por controlador.
