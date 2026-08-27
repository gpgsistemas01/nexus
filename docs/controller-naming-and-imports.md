# Convenciones de nombres e imports en controladores

Los controladores deben importar cada función con el nombre que exporta su módulo de origen. No se deben usar alias para adaptar el nombre de un servicio al contexto del controlador, porque el alias oculta el contrato real entre capas y dificulta encontrar sus usos.

```js
// Recomendado
import { findAllWastes } from '../../../services/warehouse/wasteService.js';

// Evitar
import { findAllWastes as findAllWasteItems } from '../../../services/warehouse/wasteService.js';
```

Las funciones exportadas por un archivo `*Controller.js` no llevan el sufijo `Controller`: la ubicación del módulo ya expresa esa responsabilidad. Su nombre describe la acción HTTP y el recurso sobre el que opera, siguiendo los verbos usados por el CRUD (`get`, `register`, `edit` o `remove`).

Cuando una acción del controlador y un servicio relacionado podrían tener el mismo nombre, ambos contratos deben conservar nombres descriptivos en lugar de resolver la colisión mediante un alias. Por ejemplo, `registerGoodsIssueDetailReturn` identifica la creación del recurso desde el controlador, mientras que `returnGoodsIssueDetail` describe la operación de dominio importada del servicio.

Las rutas deben importar y registrar el nombre exportado por el controlador sin renombrarlo. Cualquier cambio de nombre debe actualizar en conjunto la exportación, el import de la ruta y las pruebas del controlador.
