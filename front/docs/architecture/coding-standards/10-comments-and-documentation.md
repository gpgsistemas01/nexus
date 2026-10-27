# 10. Comentarios y documentación

## Intención

Comentar una restricción o decisión que no sea evidente por el código. No narrar cada
asignación. Los contratos públicos tipados y nombres concretos explican entrada y
salida; un comentario añade el motivo de una excepción, de una guarda de concurrencia
o de un dato histórico. Eliminar comentarios obsoletos al cambiar el comportamiento.

## Propiedad documental

Los requisitos describen obligación y objetivo; arquitectura, componentes y contratos;
los patrones, problema, colaboración y límites; las guías de módulo, realización; las
pruebas, condiciones y evidencia. No copiar la secuencia completa en cada documento.
Enlazar al propietario local y mantener íntegro el contenido que le corresponde.

Cada patrón aplicado tiene modelo general y diagramas específicos con símbolos del
código, fuente y semántica de flechas. Distinguir dependencia, evento y secuencia.
Una figura de funciones/composables no se denomina diagrama UML de clases si no modela
clases. No asignar nombres GoF a cualquier helper ni afirmar SOLID por tener carpetas.

## Referencia generada

No editar a mano `docs/architecture/views/development/code-reference.md`. Ejecutar
`npm run docs:generate` después de mover archivos, imports o contratos SFC y conservar
la salida en Git. La referencia declara símbolos; las decisiones se redactan en las
vistas curadas. `docs:check` comprueba frescura y fuentes, no toda la prosa.

## Edición y publicación

Usar Markdown, encabezados jerárquicos, rutas relativas y casos con IDs estables.
Las figuras Mermaid se exportan con el motor común. Cuando cambian diagramas,
comprobar renderizado y una publicación DOCX/PDF legible. Fuentes y resultados
documentales se guardan fuera de `public`/`dist` y del contenedor de producción.
