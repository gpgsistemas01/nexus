# Integración de reglas públicas y presentación de datos

El cliente reutiliza validadores y utilidades públicas mediante alias `@nexus/*`.
Los composables los adaptan a los formularios; los mappers construyen los datos
de cada solicitud. Esta guía localiza esas fuentes y explica su integración.
Las obligaciones de captura, secretos y salida se definen en el
[estándar de seguridad](../../security-standards.md).

## Fuentes compartidas

### Validadores consumidos

Los alias de [Vite](../../../../vite.config.ts) apuntan a módulos de `back/src/public`
y `back/src/shared`. Sus dependencias permiten compilarlos para el navegador:
no utilizan servicios privados, Prisma, middleware del servidor ni bibliotecas de Node.

| Regla actual | Ubicación y ejemplos | Clasificación |
| --- | --- | --- |
| Campos requeridos, tipos y longitudes | [baseValidations](../../../../../back/src/public/js/utils/validations/baseValidations.js), [inputValidation](../../../../../back/src/shared/constants/inputValidation.js) y [auth](../../../../../back/src/shared/constants/auth.js). | Contrato público compartible. Mantener límites comunes; no copiar sus literales en Vue. |
| Formatos de texto, UUID v4, fechas, booleanos y precisión decimal | [fieldValidations](../../../../../back/src/public/js/utils/validations/fieldValidations.js) y constantes de entrada. | Contrato público compartible. Un UUID válido no demuestra que el registro exista o que el usuario tenga acceso. |
| Captura de login | [loginValidation](../../../../../back/src/public/js/utils/validations/loginValidation.js). | Compartible: requerido, texto y máximo de 50 caracteres para usuario/contraseña. La contraseña conserva exactamente su contenido; el nombre se recorta. |
| Alta/cambio de contraseña y nombre de usuario | `userValidation`, `userEditValidation` y `userPasswordValidation` en [validators](../../../../../back/src/public/js/utils/validations/validators.js). | Política pública de captura del dominio Identidad. No aplicar al login los requisitos de alta: impediría usar credenciales históricas válidas. |
| Campos y colecciones de cada operación | Materiales, Mermas, Directorio, Personas, Catálogos, Compras y Salidas en `validators.js`. | Esquemas públicos por dominio: factura condicional, dimensiones pareadas, pesos, detalles y áreas repetidas. No son todos validadores genéricos. |
| Reglas de pesos y pares de captura | [weightValidations](../../../../../back/src/shared/validation/weightValidations.js). | Compartibles: precisión, límites y total mayor que cono. La referencia del material y las dimensiones persistidas las resuelve el backend. |
| Momento y presentación del error | `useFormInteraction`, `useLoginForm`, `createIssueValidationSchema` y `createPurchaseValidationSchema`. | Integración propia de Vue/VeeValidate. Estado touched, submit, modo y ciclo de vida permanecen en `front/`. |

### Utilidades y metadatos por alias

Los alias `@nexus/*` incorporan validadores, cálculos, metadatos y utilidades públicas.
Cada grupo conserva una responsabilidad definida:

| Alias | Contenido actual | Responsabilidad |
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

Las reglas de vista previa y las sugerencias de área/proyecto pertenecen al
contrato público. La API consulta los registros y calcula el resultado persistido;
el cliente no sustituye esas comprobaciones.

## Resolución durante la compilación

[Vite](../../../../vite.config.ts) y los `paths` de
[TypeScript](../../../../tsconfig.app.json) resuelven los alias hacia los archivos
públicos del checkout. El build incorpora sus dependencias transitivas en `dist`:
por ejemplo, `fieldValidations` utiliza mensajes y validadores de pesos. Sus
adaptadores HTTP del servidor permanecen fuera del cliente.

La [vista física](../physical/runtime-and-build.md) muestra las fuentes necesarias
para compilar y los archivos servidos después. La [guía de despliegue](../../../development/03-build-and-deployment.md)
contiene los comandos y el contexto de construcción.

## Adaptación en formularios y payloads

| Punto del recorrido | Integración propia |
| --- | --- |
| Login | `useLoginForm` adapta `loginValidation` a VeeValidate. Recorta el nombre y conserva el contenido de la contraseña. |
| Captura por modo | `createIssueValidationSchema` y `createPurchaseValidationSchema` eligen las reglas y leen los valores actuales al validar; la [fábrica de esquemas](design-and-construction-patterns/07-schema-factories.md) desarrolla el mecanismo. |
| Interacción | `useFormInteraction` distingue precarga, cambio y envío. Su [contrato tipado](../logical/class-and-type-models/09-reactive-contracts.md) conserva el vocabulario del código. |
| Construcción del request | Los mappers seleccionan los campos admitidos para la operación. Los [contratos HTTP](../../contracts/client-contracts.md) precisan versiones, claves idempotentes y aceptación de la respuesta. |

El número de proyecto utiliza `FORM_FIELD_LIMITS.PROJECT_NUMBER` y
`PROJECT_NUMBER_PATTERN`: admite hasta 10 caracteres y rechaza controles internos.
`TEXT_INPUT_PATTERN` conserva las restricciones del campo; no es un sanitizador HTML.
Las reglas de login y las de alta de contraseña son contratos diferentes.

## Presentación de datos recibidos

Los campos actuales contienen texto plano, números, fechas y opciones.
`CatalogTable` y `ServerTable` presentan texto mediante Vue/Vuetify; los formularios
lo asignan a valores de controles. `feedback.ts` utiliza SweetAlert2 con `titleText`
y `text` al abrir o actualizar un aviso. No hay un paso de limpieza HTML ni un
filtro de Axios que cambie todas las cadenas de las respuestas.

`vue/no-v-html` se configura como error en ESLint. La revisión de otros puntos de
salida sigue el [estándar de seguridad](../../security-standards.md#cambios-de-contexto-de-salida).
Las pruebas y sus límites se mantienen en el
[diseño de seguridad de texto y avisos](../../../testing/design/07-shared.md#seguridad-de-texto-y-avisos).
