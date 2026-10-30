# 7. Fábricas funcionales de esquemas

## Propósito y funcionamiento

La fábrica es una función que devuelve las reglas del formulario según recurso
y modo. El esquema resultante contiene validadores por campo. Estos validadores
consultan los valores actuales mediante `getValues` cuando se ejecutan; construir
el esquema todavía no valida la captura.

## Modelo general de construcción de un esquema

**Identificador:** `DIA-VUE-GEN-006`. **Pregunta:** ¿cómo variar validación sin
copiar reglas en cada componente? **Fuente:** factories actuales de formularios.
**Notación:** actividad con notación de flujo; terminales = inicio/retorno,
rombos = decisiones, rectángulos = construcción y paralelogramos = datos/producto.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    start([Inicio]) --> context[/Contexto y acceso a captura vigente/]
    context --> editable{¿El contexto valida campos?}
    editable -->|no| empty[/Esquema vacío/]
    editable -->|sí| rules[Seleccionar reglas del contexto]
    rules --> build[Crear funciones que leen la captura al ejecutarse]
    build --> schema[/Esquema de validadores/]
    empty --> finish([Devolver esquema])
    schema --> finish
```

## Aplicación al esquema del editor de Salidas

**Identificador:** `DIA-VUE-APL-006`. **Pregunta:** ¿quién elige las reglas y quién
las ejecuta sobre la captura actual? **Fuente:** `createIssueValidationSchema`,
`useIssueEditor` y `@nexus/form-validation`. **Notación:** actividad de construcción
con las ramas del código. VeeValidate recibe el producto en `useIssueEditor` y
ejecuta después sus funciones cuando valida la captura.

```mermaid
flowchart TB
    start([createIssueValidationSchema]) --> mode{mode}
    mode -->|view o return| empty[/return: esquema vacío/]
    mode -->|supply| details[/return: validador details/]
    mode -->|header| headerRules[issueHeaderValidation]
    mode -->|create o edit| resource{resource}
    resource -->|wastes| wasteRules[wasteIssueValidation]
    resource -->|materials o consumables| goodsRules[goodsIssueValidation]
    headerRules --> build[Object.fromEntries:<br/>crear validadores con getValues]
    wasteRules --> build
    goodsRules --> build
    build --> schema[/return: validadores por campo/]
    details --> finish([Fin de la construcción])
    empty --> finish
    schema --> finish
```

## Código, contrato y límites

[issueForm](../../../../../src/modules/issues/issueForm.ts) adapta las reglas; el esquema
de `view`/`return` es vacío en el editor principal. `supply` comprueba detalles
pendientes seleccionados y cantidad de proyecto. `header` valida encabezado;
`create`/`edit` usan las reglas del recurso. Devolución tiene captura y validación
propias. [useIssueEditor](../../../../../src/modules/issues/composables/useIssueEditor.ts)
conecta el esquema a `useForm`, sin validar al montar.

[purchaseForm](../../../../../src/modules/purchases/purchaseForm.ts) aplica la misma decisión
para alta/edición. La adaptación `mensaje || true` pertenece a VeeValidate;
los predicados públicos devuelven mensaje o `null`. `getValues` evita validar una
instantánea anterior. Los tipos discriminados de `issue.ts`/`purchase.ts` expresan
operaciones admitidas en TypeScript; la validación definitiva de cada petición HTTP corresponde a la API.

[issueTest](../../../../../tests/unit/modules/issues/issueTest.ts),
[purchaseTest](../../../../../tests/unit/modules/purchases/purchaseTest.ts) y las
[pruebas de paridad](../../../../../../back/tests/unit/validators/formValidationParityTest.js)
protegen captura y solicitudes. No se trasladan reglas privadas ni comprobaciones
de existencias/estado al esquema del navegador.
