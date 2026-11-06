# 9. Comentarios del código

Comentar restricciones o decisiones que el código no explica: excepciones, guardas de
concurrencia o datos históricos. Usar nombres y contratos tipados para describir entradas
y salidas. Evitar narrar asignaciones y retirar comentarios obsoletos.

## Ejemplo de comentario con intención

Fragmento de `blur` en
[useFormInteraction.ts](../../../src/shared/composables/useFormInteraction.ts):

```ts
const blur = (field: Field) => {
    // El foco inicial y los valores cargados por código no son captura del usuario.
    if (editedFields.has(field) || form.submitCount.value > 0) {
        return form.validateField(field);
    }
};
```

El comentario explica el motivo de la condición. Añadir «validar el campo» antes
del `return` repetiría la llamada sin aportar información.

Los comentarios se mantienen junto al código que explican. Las guías, diagramas y
referencias generadas siguen el [estándar documental](../../governance/01-documentation-rules.md).
