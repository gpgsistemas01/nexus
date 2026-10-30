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

**Identificador:** `DIA-VUE-APL-006`. **Pregunta:** ¿qué producto se construye para
cada modo y recurso? **Fuente:** `createIssueValidationSchema`,
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

## Ejecución general del producto de la fábrica

**Identificador:** `DIA-VUE-GEN-009`. **Pregunta:** ¿cuándo lee la captura una regla
construida por la fábrica? **Fuente:** fábricas de `issueForm` y `purchaseForm`.
Secuencia conceptual: la construcción devuelve funciones;
su ejecución posterior obtiene los valores vigentes mediante un callback.

```mermaid
sequenceDiagram
    autonumber
    participant Consumer@{ "type": "control" } as Propietario del formulario
    participant Factory as Fábrica de esquema
    participant Validator as Validador construido
    participant Rule as Regla seleccionada
    Consumer->>Factory: nowrap: construir(contexto, getValues)
    Factory-->>Consumer: nowrap: esquema de funciones de<br/>validación
    Consumer->>Validator: nowrap: solicitar evaluación de un<br/>campo
    Validator->>Consumer: nowrap: getValues()
    Consumer-->>Validator: nowrap: captura vigente
    Validator->>Rule: nowrap: comprobar dato del campo
    Rule-->>Validator: nowrap: mensaje o ausencia de error
    Validator-->>Consumer: nowrap: mensaje o resultado válido
```

## Ejecución del esquema de Salidas

**Identificador:** `DIA-VUE-APL-012`. **Pregunta:** ¿qué colaboración evita validar
un payload anterior? **Fuente:** `useIssueEditor`, `createIssueValidationSchema`,
`mapIssueFormToRequest` y las reglas públicas de `@nexus/form-validation`.
Secuencia de un campo de `create`, `edit` o `header`; la selección de las otras
ramas permanece en `DIA-VUE-APL-006`. VeeValidate invoca la función configurada.

```mermaid
sequenceDiagram
    autonumber
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    participant Factory as issueForm.ts
    participant Mapper as issueRequest<br/>Mapper.ts
    participant Rules as Reglas públicas<br/>validators.js
    Editor->>Factory: nowrap: createIssueValidationSchema({<br/>resource, mode, getValues })
    Factory-->>Editor: nowrap: validationSchema: funciones<br/>por campo
    Note over Editor,Factory: Evaluación posterior de un campo del esquema
    Factory->>Editor: nowrap: getValues()
    Editor-->>Factory: nowrap: form.values vigente
    Factory->>Mapper: nowrap: mapIssueFormToRequest(values,<br/>resource, mode)
    Mapper-->>Factory: nowrap: request
    alt nowrap: field === 'requestDate'
        Factory->>Rules: nowrap: rule(values.requestDate)
    else nowrap: otro campo
        Factory->>Rules: nowrap: rule(request[field])
    end
    Rules-->>Factory: nowrap: mensaje o null
    Factory-->>Editor: nowrap: mensaje o true como resultado<br/>de validación
```

## Código, contrato y límites

| Condición | Precisión que complementa el flujo |
| --- | --- |
| Esquema principal vacío para `return` | Devolución tiene formulario y validación propios; el esquema vacío no omite su validación. |
| Esquema de surtido | Comprueba detalles pendientes seleccionados y su cantidad de proyecto. |
| Resultado de una regla pública | Mensaje o `null`; la adaptación `mensaje || true` corresponde a VeeValidate. |

La [integración de reglas públicas](../input-handling.md#adaptación-en-formularios-y-payloads)
explica su adaptación; el [estándar de formularios](../../../interface-standards.md#formularios),
cuándo se presentan los errores.

[issueTest](../../../../../tests/unit/modules/issues/issueTest.ts),
[purchaseTest](../../../../../tests/unit/modules/purchases/purchaseTest.ts) y las
[pruebas de paridad](../../../../../../back/tests/unit/validators/formValidationParityTest.js)
protegen captura y solicitudes.
