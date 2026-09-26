# ADR-001: Secuencias por perspectiva y grupo funcional

## Estado

Aceptada el 4 de septiembre de 2026.

## Contexto

Las secuencias frontend y backend estaban almacenadas en dos archivos monolíticos. La
separación por perspectiva era correcta, pero localizar o
modificar un grupo exigía recorrer más de dos mil líneas y concentraba cambios
independientes en la misma fuente.

Los casos ya poseen grupos estables (`AUT`, `IDA`, `ALM`, `CAT`, `ENT` y `SAL`), y el
manual utiliza esos límites funcionales para localizar procedimientos. La publicación de
arquitectura puede ensamblar varias fuentes sin convertirlas en entregas independientes.

## Opciones consideradas

1. **Conservar dos archivos únicos:** mantiene pocas rutas, pero dificulta navegación y
   concentra conflictos.
2. **Crear un archivo por caso:** maximiza aislamiento, pero produce más de cien archivos y
   fragmenta excesivamente la lectura.
3. **Mezclar frontend y backend por grupo:** acerca las dos perspectivas, pero diluye sus
   responsabilidades y reglas de detalle propias.
4. **Conservar la perspectiva y dividir por grupo:** mantiene el límite técnico y crea
   capítulos funcionales de tamaño manejable.

## Decisión

Se adopta la cuarta opción. Cada perspectiva mantiene un `index.md` propietario de sus
reglas, patrones y cobertura, seguido de seis capítulos funcionales. Los identificadores
`DIA-FE-CU-*` y `DIA-BE-CU-*` no cambian. Las matrices enlazan directamente el capítulo y
el exportador conserva el orden completo del paquete.

La separación no corta la trazabilidad del recorrido. La secuencia frontend empieza con
la figura del actor canónico y termina en la frontera HTTP; la secuencia backend retoma
esa misma operación desde el cliente HTTP y desarrolla autorización, controller,
servicios y efectos. Unificarlas produciría diagramas con demasiados participantes,
mezclaría decisiones de interacción con transacciones y duplicaría la frontera común.
Por ello se enlazan mediante el mismo `CU-*`, método y endpoint en vez de mantener un
tercer diagrama combinado.

## Consecuencias

- La navegación y las revisiones quedan acotadas al grupo afectado.
- Frontend y backend mantienen fuentes canónicas independientes y simétricas.
- El actor se representa visualmente en frontend; backend conserva como límite al
  navegador o cliente HTTP y no duplica al actor humano.
- La coincidencia de método y endpoint permite continuar la lectura entre perspectivas
  sin fusionarlas en una secuencia que mezcle niveles de detalle.
- Las reglas comunes no se repiten en los capítulos.
- El exportador y el verificador deben conocer el orden de la colección.
- Agregar otro grupo exige actualizar ambos índices, el manifiesto y la validación de
  cobertura.
