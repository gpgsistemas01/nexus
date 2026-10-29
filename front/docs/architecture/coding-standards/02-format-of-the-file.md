# 2. Formato del archivo y separación visual

## Archivo y formato automatizado

| Elemento | Regla vigente | Control |
| --- | --- | --- |
| Codificación | UTF-8, LF, sin espacios al final y con salto final. | `.editorconfig` y Prettier. |
| Sangría | Cuatro espacios; pruebas TypeScript y `package.json`, dos. | Overrides de Prettier; `.editorconfig` define también los JSON npm. |
| Literales | Comillas simples en JavaScript/TypeScript y punto y coma. | Prettier. |
| Ancho | Referencia de 100 caracteres; no cortar manualmente cadenas o URLs para satisfacerla. | `printWidth` de Prettier. |
| Objetos/llamadas | Coma final donde la sintaxis lo admite. | `trailingComma: all`. |
| Templates | Un atributo por línea en elementos multilínea; anidación legible. | `singleAttributePerLine` y formateador Vue. |
| SFC | Separar bloques `script`, `template` y `style` con una línea vacía. | Reglas `vue/block-tag-newline` y `vue/padding-line-between-blocks`. |

`htmlWhitespaceSensitivity: 'ignore'` permite separar etiquetas y cierres del template.
El espacio visual de elementos inline se expresa mediante texto o estilos; no depende
de espacios accidentales del archivo. `eslint-config-prettier` evita reglas de
formato que compitan con Prettier.

## Líneas vacías con significado

Separar imports del código ejecutable. Los imports consecutivos pueden permanecer
juntos. Separar declaraciones de funciones y bloques de control de las fases vecinas;
después de una guarda `if` debe verse la fase que continúa. ESLint comprueba estas
separaciones en `src` con `padding-line-between-statements`.

Fragmento de `update` en
[useFormInteraction.ts](../../../src/shared/composables/useFormInteraction.ts):

```ts
const update = (field: Field, value: Value) => {
    if (options.isDisabled() || form.values[field] === value) return;

    editedFields.add(field);
    form.setFieldValue(field, value, false);
    form.setFieldError(field, undefined);
    options.onChange();
};
```

La línea vacía separa la guarda de las actualizaciones; cuatro espacios delimitan el
cuerpo. `Field`, `Value`, `form` y `options` pertenecen al composable que contiene esta
función. No usar varias líneas vacías para ocultar una responsabilidad que necesita
separarse.

## Orden y tamaño

Imports al principio; después tipos/constantes y la lógica en un orden que facilite
seguir sus dependencias. En SFC se conserva el orden local de script, template y
estilos. No se mezclan cambios de formato de archivos ajenos con un cambio funcional.
No existe un número de líneas que por sí solo determine una clase o un composable.

## Comprobación

Desde `front/`, `npm run format` aplica ESLint y Prettier; `npm run format:check`
comprueba el formato y `npm run lint` comprueba las reglas adicionales. Prettier no
formatea las guías Markdown mediante estos scripts; sus tablas, encabezados y saltos
se revisan conforme al gobierno documental.
