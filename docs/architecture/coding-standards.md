# Estándar de codificación

## 1. Propósito, alcance y prioridad

Este documento es la fuente de verdad única para las convenciones de código de Nexus.
Las decisiones de arquitectura explican responsabilidades y patrones; las reglas de
nombres, formato, imports, exports y organización de un archivo se mantienen aquí para
no crear estándares parciales o contradictorios.

El estándar aplica a JavaScript del servidor y navegador, EJS, pruebas, scripts y
configuración mantenida por el proyecto. Prisma, SQL y Markdown conservan además las
convenciones propias de su lenguaje. Se aplica al código nuevo y a las líneas que se
modifican; no autoriza reformatear módulos ajenos al cambio ni mezclar una corrección
funcional con una reescritura general.

Si dos reglas parecen competir, se aplica esta prioridad:

1. contrato funcional, seguridad e integridad de datos;
2. patrón de la capa o componente compartido vigente;
3. este estándar;
4. estilo local, sólo cuando este documento no define el caso.

## 2. Formato del archivo

### 2.1 Indentación

- Se usan espacios, nunca tabuladores.
- El código bajo `src`, `scripts` y archivos de configuración usa cuatro espacios por
  nivel.
- Las pruebas bajo `tests` usan dos espacios por nivel para conservar la convención de
  sus suites.
- El contenido de un bloque aumenta exactamente un nivel. Un cierre queda alineado con
  la construcción que abrió el bloque.
- En expresiones multilínea, los elementos hermanos comparten columna o nivel. No se
  alinean manualmente con grupos variables de espacios, porque una edición cercana
  rompería esa alineación.
- En EJS, la indentación representa la estructura HTML resultante. Las directivas EJS
  se alinean con el elemento o bloque al que pertenecen.

### 2.2 Líneas, espacios y fin de archivo

- Cada archivo de texto termina con una sola nueva línea. No se agregan líneas vacías
  adicionales al final.
- No quedan espacios al final de una línea ni líneas que sólo contengan espacios.
- Se usa una línea vacía entre imports y declaraciones de módulo, entre funciones de
  nivel de módulo y entre fases semánticas de una función.
- No se coloca una línea vacía inmediatamente después de abrir una función, condición,
  ciclo u objeto, ni inmediatamente antes de cerrarlo.
- No se separa con una línea vacía una declaración de su uso inmediato, cada propiedad
  de un objeto ni cada sentencia de un mismo paso.
- Una línea extensa se divide por unidades semánticas: argumentos, propiedades, imports
  nombrados o condiciones. No se introduce un límite rígido que obligue a fragmentar
  rutas, mensajes o identificadores indivisibles; una línea debe poder revisarse sin
  desplazamiento horizontal cuando exista un corte natural.
- Cada sentencia JavaScript termina en punto y coma.
- Se deja un espacio después de coma y alrededor de operadores binarios. No hay espacio
  entre nombre de función y `(`, ni dentro de paréntesis, corchetes o llaves vacías.

### 2.3 Comillas, plantillas y literales

- Cada archivo mantiene una sola convención para strings ordinarios; al modificarlo se
  conserva la predominante. No se cambian comillas sólo por estilo.
- Los template literals se reservan para interpolación o texto multilínea; no sustituyen
  una cadena estática.
- Los números, estados, permisos, selectores, nombres de eventos y mensajes compartidos
  se importan desde constantes. Un literal local permanece local si pertenece a una
  única operación y no expresa una regla reutilizable.
- No se concatenan fragmentos cuando un template literal hace explícita la intención.

### 2.4 Ejemplo de formato

El ejemplo conserva cuatro espacios en código de aplicación, divide una condición por
unidades semánticas y separa la guarda del recorrido normal:

```js
const findActiveMaterial = async ({ materialId, warehouseId }) => {
    if (!materialId || !warehouseId) return null;

    const material = await findMaterial({
        materialId,
        warehouseId
    });

    return material?.isActive ? material : null;
};
```

No se alinea `warehouseId` con espacios variables ni se reemplaza la guarda por un
bloque anidado. En una prueba equivalente se usan dos espacios por nivel.

## 3. Nomenclatura

### 3.1 Reglas generales

- Nombres de variables, funciones y propiedades JavaScript usan `camelCase`.
- Clases y tipos conceptuales usan `PascalCase`; las clases de error mantienen el
  sufijo `Error`.
- Constantes inmutables que representan catálogos, configuración global o valores
  compartidos usan `UPPER_SNAKE_CASE`. Una referencia `const` local a un objeto o
  servicio conserva `camelCase` si su identidad no es una constante de dominio.
- Los nombres están en inglés para coincidir con el código vigente. Texto visible,
  mensajes funcionales y documentación pueden estar en español.
- No se crean abreviaturas nuevas salvo las asentadas en el proyecto (`DTO`, `API`,
  `URL`, `DOM`, `JWT`). Dentro de `camelCase`, se escriben como palabra: `apiRoute`,
  `userDto`, `databaseUrl`.
- El nombre expresa propósito, no implementación incidental. Se evita `data`, `item`,
  `value`, `temp` o `handler` cuando el dominio permite un nombre preciso.

### 3.2 Funciones, booleanos y colecciones

- Una función inicia con un verbo que describe su efecto: `find`, `get`, `create`,
  `register`, `update`, `edit`, `remove`, `validate`, `normalize`, `map`, `format` o
  `render` según corresponda.
- Los booleanos expresan una pregunta o estado mediante `is`, `has`, `can`, `should` o
  `requires`. No se usa una negación doble.
- Las colecciones se nombran en plural; un registro individual, en singular.
- Los callbacks breves pueden usar nombres convencionales como `req`, `res`, `next`,
  `tx` o `event`. Fuera de esos contratos se prefiere el nombre completo.
- Una función que construye otra capacidad utiliza `create<Capacidad>`; una que adapta
  datos utiliza `map`, `normalize` o `format`, no `create` si no crea una entidad.

### 3.3 Archivos y directorios

- Archivos JavaScript usan `camelCase.js`, salvo clases cuyos archivos conservan el
  nombre `PascalCase.js`, como `AppError.js`.
- Directorios usan `camelCase` y representan dominio o responsabilidad, no una sola
  función accidental.
- Sufijos comunican la capa: `Controller`, `Service`, `Repository`, `Route`, `DTO`,
  `Validation`, `Middleware`, `Utils` y `Test` se usan únicamente cuando el archivo
  cumple esa responsabilidad.
- Las rutas web y API conservan `WebRoute.js` y `ApiRoute.js`. Las integraciones con BD
  terminan en `ControllerDbTest.js`.
- No se crea un archivo barril `index.js` sólo para acortar imports. Un `index.js`
  existente representa un punto real de composición o registro.

## 4. Imports, exports y dependencias

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

## 5. Convenciones de controladores y rutas

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

## 6. Funciones y control de flujo

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

## 7. Objetos, colecciones y datos

- Se usa destructuring cuando nombra con claridad los campos consumidos; no se destruye
  un objeto completo para volver a reconstruirlo sin propósito.
- Los objetos multilínea tienen una propiedad por línea y coma final sólo si ésa es la
  convención predominante del archivo.
- `map` transforma, `filter` selecciona, `find` obtiene un elemento y `some`/`every`
  responden condiciones. No se usa `map` sólo por sus efectos secundarios.
- Las búsquedas repetidas en una colección grande se preparan como `Map` o `Set` cuando
  mejora de forma relevante la intención y el costo; no se optimiza sin una necesidad
  observable.
- Fechas, decimales y cantidades atraviesan DTOs y utilidades existentes. No se confía
  en coerción implícita ni se convierte un decimal de dominio a un entero.
- `null`, `undefined` y string vacío no son intercambiables. Cada frontera aplica la
  normalización declarada por su contrato.
- Los datos recibidos del cliente se tratan como no confiables aunque ya exista
  validación en el navegador.

## 8. Frontend, DOM y EJS

- Los selectores compartidos, eventos, modos de formulario y mensajes se importan desde
  sus constantes.
- Una página registra eventos y configura componentes; no duplica validación, requests o
  manipulación ya encapsulada en `application`, `ui` o plugins.
- Se reutilizan parciales bajo `views/shared` antes de crear markup equivalente. Un
  parcial nuevo debe representar una unidad configurable, no una copia con otro nombre.
- Los atributos `id`, `name` y `data-*` expresan recurso y propósito. JavaScript consulta
  primero los selectores compartidos del flujo.
- Se evita insertar HTML construido con datos no confiables. Se usan APIs de texto,
  plantillas y escape EJS según el contrato existente.
- Al tocar una vista EJS se preserva en su posición la última línea de `contentFor`; no
  se elimina y vuelve a agregar como efecto del formato.
- Una refactorización no reindenta toda la vista si sólo cambia un bloque. Esto reduce
  ruido y permite revisar que las etiquetas continúen balanceadas.

### 8.1 Ejemplo de reutilización y preservación EJS

Una página configura un parcial existente en lugar de repetir el modal:

```ejs
<%- include('../../../shared/layout/modal', { modalId: 'materialModal', form }) %>

<%- contentFor('layoutType') %>
site
```

Si el cambio afecta el include, las dos últimas líneas permanecen exactamente en esa
posición: no se eliminan para volver a agregarlas al final. Un nuevo parcial sólo se
justifica si requiere un contrato visual reutilizable que el parcial vigente no puede
expresar mediante configuración.

## 9. Errores, seguridad, auditoría y logging

- Se reutilizan `AppError` y los errores de dominio existentes. No se arrojan strings ni
  se responde con una forma de error exclusiva de un endpoint.
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

## 10. Comentarios y documentación

- Un comentario explica una restricción, decisión o consecuencia no evidente; no narra
  la siguiente línea.
- TODOs incluyen una acción concreta y referencia rastreable cuando exista. No se deja
  código comentado como mecanismo de respaldo.
- Funciones privadas claras no requieren JSDoc. Los contratos reutilizables o complejos
  documentan parámetros, retorno y errores sólo cuando el tipo no resulta evidente del
  nombre y uso.
- Un cambio de comportamiento actualiza requisitos, arquitectura o datos en el artefacto
  curado propietario. Cambios en routers, imports entre áreas o Prisma regeneran los
  documentos mediante `npm run docs:architecture`.
- La [guía de documentación técnica](technical-code-documentation.md) decide cuándo la
  explicación permanece junto al código, actualiza una vista Mermaid o enlaza un
  diagrama ya existente.
- La documentación usa los términos canónicos del glosario y enlaza la fuente de verdad
  en lugar de copiar extensamente su contenido.

## 11. Pruebas

Las pruebas demuestran comportamiento y reglas del CRUD; no fijan formato, orden de
imports, nombres privados ni estructura incidental sólo para comprobar este estándar.

- Unitarias replican la ruta del módulo bajo `tests/unit`.
- Controllers unitarios viven en `tests/unit/controllers/<tipo>/<dominio>`.
- Rutas unitarias viven en `tests/unit/routes/<tipo>/<dominio>`.
- Integraciones HTTP con Prisma viven en `tests/integration/controllers` y terminan en
  `ControllerDbTest.js`.
- Helpers compartidos viven en `tests/helpers` y tienen prueba propia cuando contienen
  lógica.
- Los nombres de `describe` identifican la unidad o flujo; los de `it` expresan regla,
  condición y resultado observable.
- Una prueba sigue preparación, ejecución y aserción, separadas por líneas vacías cuando
  haga más claro el recorrido. No se introducen comentarios AAA repetitivos.
- Cada escritura integrada se verifica mediante lectura posterior con Prisma. Un fallo
  compuesto demuestra ausencia de escrituras parciales.
- Se reutilizan harness, factories y fixtures; cada contexto conserva la integración que
  demuestra su router, configuración, persistencia y efectos propios.
- No se agregan pruebas de HTML, selectores o implementación interna cuando el plan de
  pruebas declara que ese nivel no aporta evidencia CRUD.

### 11.1 Ejemplos de ubicación y evidencia CRUD

La ruta de la prueba reproduce la del módulo, sin crear una carpeta alternativa por
funcionalidad:

```text
src/services/warehouse/materials/materialService.js
tests/unit/services/warehouse/materials/materialServiceTest.js

src/controllers/api/warehouse/materialController.js
tests/unit/controllers/api/warehouse/materialControllerTest.js
tests/integration/controllers/materialControllerDbTest.js
```

Una integración de actualización no termina al comprobar el código HTTP. Persiste,
consulta nuevamente y afirma el resultado observable:

```js
it('actualiza el material y conserva sus relaciones', async () => {
  const response = await request(app)
    .put(`/api/warehouse/materials/${ material.id }`)
    .send({ name: 'Material actualizado' });

  const persistedMaterial = await prisma.material.findUnique({
    where: { id: material.id },
    include: { suppliers: true }
  });

  expect(response.status).toBe(200);
  expect(persistedMaterial.name).toBe('Material actualizado');
  expect(persistedMaterial.suppliers).toHaveLength(1);
});
```

Para crear, consultar, actualizar y desactivar se reutiliza el mismo harness de la
suite. Los casos negativos verifican rechazo y ausencia de escritura parcial, no la
cantidad de llamadas internas a helpers o el orden de imports.

## 12. Lista de revisión

Antes de confirmar un cambio se verifica:

1. ¿Se reutilizó un flujo, factory, helper, parcial o componente existente antes de crear
   otro?
2. ¿Nombres, archivos y orden de operaciones expresan el dominio y la capa?
3. ¿Imports y exports están completos, directos y sin símbolos sin uso, y cada alias
   responde a un contrato compartido o una colisión documentable?
4. ¿Indentación, saltos de línea, espacios, comillas y fin de archivo respetan el área
   modificada?
5. ¿La escritura compuesta conserva transacción, autorización, auditoría y errores?
6. ¿Las pruebas están en la ubicación declarada y verifican el CRUD o regla afectada?
7. ¿Las vistas reutilizan componentes y preservan la última línea EJS?
8. ¿La documentación curada y generada quedó sincronizada?

La revisión mínima ejecuta las pruebas relacionadas, la suite unitaria,
`npm run docs:check` y `git diff --check`. La integración se ejecuta con la base aislada
cuando el cambio afecta persistencia, transacciones, routers CRUD o esquema.
