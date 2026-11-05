# Reglas públicas y datos del formulario

Los alias `@nexus/*` incorporan módulos públicos al cliente durante el build.
Los composables adaptan esas reglas a los formularios y los mappers preparan
las solicitudes.

## Fuentes compartidas

| Alias y fuente | Uso |
| --- | --- |
| [@nexus/numbers](../../../../../back/src/shared/utils/numberUtils.js) | Redondeo y normalización decimal. |
| [@nexus/issue-header-rules](../../../../../back/src/public/js/application/warehouse/issues/issueHeaderRules.js) | Cliente interno, asesores y proyecto sugerido por área. |
| [@nexus/issue-statuses](../../../../../back/src/public/js/constants/fulfillmentStatuses.js) | Estados utilizados al presentar acciones de Salidas. |
| [@nexus/login-validation](../../../../../back/src/public/js/utils/validations/loginValidation.js) | Reglas de usuario y contraseña de acceso. |
| [@nexus/purchase-calculations](../../../../../back/src/shared/inventory/goodsReceiptCalculations.js) | Cantidades, costos e importes de la vista previa de Compras. |
| [@nexus/date-time](../../../../../back/src/public/js/utils/timeZone.js) | Conversión y presentación de fechas. |
| [@nexus/form-validation](../../../../../back/src/public/js/utils/validations/validators.js) | Esquemas de captura de Inventario, Identidad, Directorio, Catálogos, Compras y Salidas. |
| [@nexus/waste-measurements](../../../../../back/src/shared/inventory/wasteMeasurements.js) | Pesos, largo y orientación de la vista previa de Merma. |
| [@nexus/catalogs](../../../../../back/src/shared/constants/catalogs.js) | Recursos administrables, campos, etiquetas y longitudes. |
| [@nexus/permissions](../../../../../back/src/shared/constants/permissions.js) | Identificadores y consulta de permisos recibidos. |
| [@nexus/api-success-codes](../../../../../back/src/shared/constants/apiSuccessCodes.js) | Códigos de confirmación de operaciones. |
| [@nexus/api-messages](../../../../../back/src/public/js/constants/apiMessages.js) | Mensajes y traducción de códigos. |

Los validadores de formulario utilizan estas fuentes de apoyo:

| Fuente | Reglas |
| --- | --- |
| [baseValidations](../../../../../back/src/public/js/utils/validations/baseValidations.js) | Campos requeridos, tipos y longitudes. |
| [fieldValidations](../../../../../back/src/public/js/utils/validations/fieldValidations.js) | Texto, UUID v4, fechas, booleanos y precisión. |
| [weightValidations](../../../../../back/src/shared/validation/weightValidations.js) | Límites de pesos y relación entre total y cono. |
| [inputValidation](../../../../../back/src/shared/constants/inputValidation.js) y [auth](../../../../../back/src/shared/constants/auth.js) | Límites y constantes de captura. |

## Resolución durante la compilación

[Vite](../../../../vite.config.ts) y [TypeScript](../../../../tsconfig.app.json)
resuelven los alias hacia las fuentes del checkout. El build incluye sus
dependencias en `dist`; en ejecución no lee archivos del contenedor API.
La [vista física](../physical/runtime-and-build.md) representa esa separación.

## Adaptación en formularios y payloads

| Punto | Código responsable |
| --- | --- |
| Login | `useLoginForm` adapta las reglas de acceso a VeeValidate; recorta el nombre y conserva la contraseña. |
| Captura por modo | `createIssueValidationSchema` y `createPurchaseValidationSchema` eligen las reglas y leen los valores actuales. |
| Interacción | `useFormInteraction` distingue precarga, cambios y envío. |
| Solicitud | Los mappers seleccionan y normalizan los campos admitidos por operación. |

El login usa sus propias reglas; la política de contraseñas nuevas pertenece a
`userValidation` y `userPasswordValidation` de `form-validation`.
El número de proyecto utiliza `FORM_FIELD_LIMITS.PROJECT_NUMBER` y
`PROJECT_NUMBER_PATTERN`: hasta 10 caracteres, sin controles internos.

La [fábrica de esquemas](design-and-construction-patterns/07-schema-factories.md)
muestra la construcción del validador. Los [contratos HTTP](../../contracts/client-contracts.md)
definen los datos enviados y la confirmación esperada.

## Presentación de datos recibidos

Las tablas y controles presentan texto mediante Vue/Vuetify. `feedback.ts` usa
`titleText` y `text` de SweetAlert2. Los cálculos del navegador son vistas previas;
la API valida y calcula el resultado persistido.

El [estándar de seguridad](../../security-standards.md) concentra las reglas sobre
texto, secretos y fronteras. Las comprobaciones están en el
[diseño de seguridad](../../../testing/design/07-shared.md#seguridad-de-texto-y-avisos).
