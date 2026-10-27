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

## Líneas vacías con significado

Separar imports del código ejecutable. Los imports consecutivos pueden permanecer
juntos. Separar declaraciones de funciones y bloques de control de las fases vecinas;
después de una guarda `if` debe verse la fase que continúa. ESLint comprueba estas
separaciones en `src` con `padding-line-between-statements`.

```ts
const submit = async () => {
    if (isSubmitting.value) return;

    isSubmitting.value = true;

    try {
        await save();
    } finally {
        isSubmitting.value = false;
    }
};
```

El ejemplo ilustra formato; el guardado real utiliza el coordinador existente.
Una línea vacía puede separar captura, transformación y confirmación. No usar varias
líneas vacías para ocultar una función que necesita dividirse por responsabilidad.

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
