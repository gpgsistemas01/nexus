# 3. Entradas, normalización y salida segura en Vue

Esta guía describe la captura, la normalización y la presentación segura de datos
en el cliente. El [índice Vue](../../../index.md) ubica sus fuentes normativas.

Los módulos actuales capturan texto plano, números, fechas, opciones y partidas.
No admiten contenido HTML escrito por usuarios. La regla general es conservar
el significado de la captura y tratarla como dato en todo el recorrido.

## Responsabilidades

| Operación | Frontend | Backend |
| --- | --- | --- |
| Normalización | El modelo del formulario recorta texto cuando su contrato lo indica y construye el payload permitido. | Validators y DTOs vuelven a normalizar el contrato antes de usarlo. |
| Validación | VeeValidate ejecuta reglas públicas para orientar la captura y presentar errores. | La API valida incluso si se omite Vue y resuelve permisos, relaciones, versiones y estado. |
| Escape de salida | Interpolación/props de texto y SweetAlert2 `titleText`/`text`. | JSON con tipo de respuesta correcto; la API devuelve datos, sin construir el DOM del cliente. |
| Sanitización HTML | No hay consumidor que la necesite. No se usa `v-html`. | Tampoco se transforman nombres en HTML “limpio”. Un futuro editor enriquecido necesita contrato propio. |

El [estándar de seguridad](../../security-standards.md) y los
[contratos del cliente](../../contracts/client-contracts.md) describen estas fronteras desde la
captura, construcción de payloads y presentación del resultado. Las reglas y sus
límites se explican aquí aunque los predicados públicos vivan junto al servidor.
La separación de estas operaciones sigue [OWASP: prevención de XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

## Captura y transporte existentes

### Qué reglas se pueden compartir

La revisión parte de los alias de [Vite](../../../../vite.config.ts), sus imports transitivos
y los consumidores del cliente. Los módulos alcanzados están en `back/src/public`
o `back/src/shared`; no importan servicios privados, Prisma, middleware del servidor
ni bibliotecas de Node. Esa compatibilidad permite compilarlos para el navegador,
pero no convierte cualquier regla de negocio en información pública.

| Regla actual | Ubicación y ejemplos | Clasificación |
| --- | --- | --- |
| Campos requeridos, tipos y longitudes | [baseValidations](../../../../../back/src/public/js/utils/validations/baseValidations.js), [inputValidation](../../../../../back/src/shared/constants/inputValidation.js) y [auth](../../../../../back/src/shared/constants/auth.js). | Contrato público compartible. Mantener límites comunes; no copiar sus literales en Vue. |
| Formatos de texto, UUID v4, fechas, booleanos y precisión decimal | [fieldValidations](../../../../../back/src/public/js/utils/validations/fieldValidations.js) y constantes de entrada. | Contrato público compartible. Un UUID válido no demuestra que el registro exista o que el usuario tenga acceso. |
| Captura de login | [loginValidation](../../../../../back/src/public/js/utils/validations/loginValidation.js). | Compartible: requerido, texto y máximo de 50 caracteres para usuario/contraseña. La contraseña conserva exactamente su contenido; el nombre se recorta. |
| Alta/cambio de contraseña y nombre de usuario | `userValidation`, `userEditValidation` y `userPasswordValidation` en [validators](../../../../../back/src/public/js/utils/validations/validators.js). | Política pública de captura del dominio Identidad. No aplicar al login los requisitos de alta: impediría usar credenciales históricas válidas. |
| Campos y colecciones de cada operación | Materiales, Mermas, Directorio, Personas, Catálogos, Compras y Salidas en `validators.js`. | Esquemas públicos por dominio: factura condicional, dimensiones pareadas, pesos, detalles y áreas repetidas. No son todos validadores genéricos. |
| Reglas de pesos y pares de captura | [weightValidations](../../../../../back/src/shared/validation/weightValidations.js). | Compartibles: precisión, límites y total mayor que cono. La referencia del material y las dimensiones persistidas las resuelve el backend. |
| Momento y presentación del error | `useFormInteraction`, `useLoginForm`, `createIssueValidationSchema` y `createPurchaseValidationSchema`. | Integración propia de Vue/VeeValidate. Estado touched, submit, modo y ciclo de vida permanecen en `front/`. |

Los adaptadores del backend usan `express-validator` y se mantienen en `back/src/validators`.
También consumen constantes públicas, pero sus cadenas `body(...)`, `req`,
normalización HTTP y traducción de errores no pertenecen a un paquete del navegador.
Compartir un predicado no permite omitir su ejecución en el servidor.

### Alias que contienen otras reglas públicas

No todos los alias `@nexus/*` son validadores. Esta distinción evita que un paquete
de validación termine absorbiendo toda la aplicación:

| Alias | Contenido actual | Propiedad recomendada |
| --- | --- | --- |
| `@nexus/login-validation` | Captura de login. | Validación pública de autenticación. |
| `@nexus/form-validation` | Esquemas de captura por operación y sus validadores. | Validación pública agrupada por dominio. |
| `@nexus/numbers` | Redondeo y normalización decimal. | Utilidades públicas; no decide saldos. |
| `@nexus/date-time` | Conversión y presentación de fechas en la zona del sistema. | Utilidades de fecha públicas. |
| `@nexus/purchase-calculations` | Cantidad convertida, costo unitario e importes neto/bruto con IVA. | Cálculos públicos de Compras para vista previa, separados de validadores. |
| `@nexus/waste-measurements` | Peso neto, largo proporcional y orientación de medidas. | Cálculos públicos de Mermas para vista previa, separados de validadores. |
| `@nexus/issue-header-rules` | Cliente interno, áreas de asesores y proyectos sugeridos por área. | Configuración pública del dominio Salidas; no es validación genérica. |
| `@nexus/issue-statuses` | Nombres de estados usados para presentar acciones. | Contrato público de Salidas; las transiciones se verifican en el backend. |
| `@nexus/catalogs` | Recursos administrables, campos, etiquetas y longitudes. | Metadatos públicos de Catálogos. |
| `@nexus/permissions` | Identificadores de permisos y consulta del usuario recibido. | Contrato público para presentar la interfaz; no concede permisos. |
| `@nexus/api-success-codes` | Códigos de confirmación. | Contrato público de respuestas. |
| `@nexus/api-messages` | Mensajes y traducción de códigos. | Presentación pública de respuestas; no contiene secretos de diagnóstico. |

Los [cálculos de Compras](../../../../../back/src/shared/inventory/goodsReceiptCalculations.js)
y [Mermas](../../../../../back/src/shared/inventory/wasteMeasurements.js) ya son públicos
y se usan para la vista previa de Vue. Para persistir, [goodsReceiptHelpers](../../../../../back/src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js)
resuelve el material desde la BD y vuelve a calcular importes;
[wasteHelpers](../../../../../back/src/services/warehouse/wastes/wasteHelpers.js) resuelve
pesos/medidas usando la oferta y su material. No se deben agregar fórmulas que
requieran confidencialidad a estos módulos públicos.

El mapa área/proyecto está repetido en la [configuración pública](../../../../../back/src/public/js/application/warehouse/issues/issueHeaderRules.js)
y en [constantes del servidor](../../../../../back/src/constants/issueHeaderRules.js). Los
valores actuales coinciden, pero pueden divergir al editar sólo una copia. Es un
candidato a una única configuración pública de Salidas; la comprobación con
cliente, asesor y área leídos de la BD debe permanecer en
[issueHeaderService](../../../../../back/src/services/warehouse/issues/issueHeaderService.js).
La sugerencia de Vue no reemplaza esa comprobación.

### Reglas que permanecen en el backend

- Comparación de contraseña, usuario/persona activos, accesos y emisión o
  verificación de tokens: [authService](../../../../../back/src/services/authService.js) y
  [userService](../../../../../back/src/services/admin/userService.js).
- Autorización de cada petición: [authMiddleware](../../../../../back/src/middleware/authMiddleware.js)
  y routers. Ocultar un botón o conocer un código de permiso no autoriza una operación.
- Existencia, relaciones, actividad y pertenencia de registros; unicidad de
  factura/usuario; reglas definitivas de cliente, asesor y proyecto.
- Stock disponible, devoluciones permitidas y estados persistidos. Por ejemplo,
  [goodsIssueReturnService](../../../../../back/src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js)
  bloquea y lee el documento, comprueba el saldo y registra el movimiento en transacción.
- Comparación de versiones, recibos idempotentes, bloqueos y transacciones. Vue
  conserva `expectedVersion`/`operationId`; el servidor aplica la garantía.

### Criterio para extraer un paquete compartido

El primer candidato a `packages/validation` son las funciones públicas de captura,
sus constantes y esquemas por dominio. Sus dependencias públicas también deben
resolverse: `fieldValidations` usa mensajes y pesos; no basta con mover el archivo
de login o cambiar un alias. La adaptación a VeeValidate permanece en Vue y la
adaptación a `express-validator` permanece en el backend. Metadatos, cálculos y
configuración de Salidas conservan exports o módulos propios.

La ubicación actual funciona durante la compilación: Vite incorpora esos módulos
en `dist`. Una extracción debe actualizar imports de los consumidores, Vue y API,
TypeScript/Vite, pruebas, Docker y configuración de compilación de las plataformas.
Los contenedores de ejecución pueden seguir separados. Esta clasificación no
convierte la propuesta de paquete en una dependencia ya implementada.

### Tratamiento de la captura

- Nombres y observaciones usan reglas compartidas por alias `@nexus/*`; conservan
  signos admitidos, Unicode y límites por campo. Los controles no imprimibles se
  rechazan, no se borran para convertir una captura inválida en otra válida.
- El número de proyecto admite hasta 10 caracteres y signos propios de su contrato;
  `PROJECT_NUMBER_PATTERN` rechaza controles internos. El mensaje de longitud toma
  `FORM_FIELD_LIMITS.PROJECT_NUMBER`, evitando anunciar 50 cuando el límite es 10.
- Una contraseña no recibe `trim`, `.normalize()`, cambio de mayúsculas ni escape HTML.
  El login conserva su política histórica; no se le impone la política de alta.
- Los payloads seleccionan campos; `expectedVersion` y `operationId` conservan
  su semántica de concurrencia. El tipo TypeScript no valida por sí solo una respuesta HTTP.
- Axios transporta y renueva sesión; no recorre recursivamente requests/responses
  para borrar etiquetas o escapar strings. Ese filtro rompería contratos y no conoce
  el contexto donde se muestra cada dato.

Las restricciones de signos de `TEXT_INPUT_PATTERN` pertenecen al contrato vigente
de esos campos; no son un sanitizador de HTML ni una garantía contra SQL/XSS.
El origen API tampoco vuelve confiable una cadena: datos antiguos o recibidos desde
otro sistema se presentan como texto igual que la captura actual.

## Salidas de Vue, Vuetify y SweetAlert2

```vue
<!-- Correcto: mostrar texto, incluso cuando contiene signos de marcado. -->
<span>{{ row.name }}</span>
```

`CatalogTable` y las tablas compuestas con `ServerTable` delegan la presentación de
texto a Vue/Vuetify. Los formularios asignan el dato a valores de controles; no lo
concatenan para construir una plantilla. `feedback.ts` utiliza `titleText` y `text`
tanto al abrir la confirmación como al actualizar un error; `showValidationMessage`
recibe una cadena estática del proyecto.

`vue/no-v-html` se configura como error. Esta regla no detecta todas las formas de
manipulación del DOM: la revisión también comprueba `innerHTML`, templates dinámicos,
contenido `html` de plugins y fuentes de URL/estilos. Los enlaces actuales del menú
proceden de la configuración de Router, no de URLs capturadas por un usuario.

Si en el futuro se capturan URLs, el servidor debe admitir protocolos y destinos
concretos. El escape automático de un atributo no valida un protocolo. Si aparece
HTML enriquecido, se revisará una biblioteca mantenida como DOMPurify y una política
de etiquetas/atributos antes de habilitar su presentación. El código no incluye un renderizador de texto enriquecido.
Estas precauciones se basan en [seguridad de Vue](https://vuejs.org/guide/best-practices/security.html).

## Evidencia y límites

`feedbackTest.ts` usa SweetAlert2 real en jsdom para comprobar título, descripción
y error como texto, sin nodos inyectados. `catalogs.spec.ts` usa Chromium con un
nombre de API que contiene un `img` y un manejador: aparece como texto en tabla y
valor de edición, sin crear el elemento ni ejecutar el manejador. Es una fixture
de respuesta histórica/externa, no un payload que el alta actual deba aceptar.

`formValidationParityTest.js` comprueba reglas compartidas y fronteras en el
backend; sus integraciones verifican rechazo sin escrituras. Las pruebas del
frontend no sustituyen esas garantías. El [registro de diseño](../../../testing/design/07-shared.md#seguridad-de-texto-y-avisos)
identifica los oráculos; estas comprobaciones no constituyen una auditoría de seguridad
completa del sistema ni como prueba de carga.
