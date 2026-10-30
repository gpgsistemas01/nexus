# 3. Coordinación de documentos y altas auxiliares

Una compra o salida combina lectura, captura y guardado. Las altas auxiliares
conservan su propia confirmación: crear un cliente o proveedor no guarda también
el documento que lo solicitó.

| Colaboración | Dónde seguirla |
| --- | --- |
| Leer el documento y descartar una respuesta sustituida | [useDocumentRead](05-document-read.md). |
| Ejecutar el guardado con una operación del dominio | [useRecordSave](08-record-save.md). |
| Elegir campos y efectos de cada operación | [Modos de compra y salida](../../../../requirements/requirements-specification/06-operation-modes-and-effects.md). |
| Distribuir captura, reglas y adaptadores | [Composición de documentos](../../development/design-and-construction-patterns/08-document-responsibilities.md). |
| Abrir un alta auxiliar y devolver la opción confirmada | [Patrón de alta contextual](../../development/design-and-construction-patterns/09-contextual-creation.md). |
| Continuar una merma duplicada como entrada | [Recuperación del duplicado](../05-warehouse/03-waste-duplicate.md). |
