# ADR-001: Secuencias por perspectiva y grupo funcional

## Estado

Aceptada el 4 de septiembre de 2026.

## Contexto

Las 63 secuencias frontend y las 63 secuencias backend estaban almacenadas en dos
archivos monolíticos. La separación por perspectiva era correcta, pero localizar o
modificar un grupo exigía recorrer más de dos mil líneas y concentraba cambios
independientes en la misma fuente.

Los casos ya poseen grupos estables (`AUT`, `IDA`, `CAT`, `ENT`, `SAL` y `REP`), y el
manual utiliza esos límites funcionales para localizar procedimientos. La publicación de
arquitectura puede ensamblar varias fuentes sin convertirlas en entregas independientes.

## Opciones consideradas

1. **Conservar dos archivos únicos:** mantiene pocas rutas, pero dificulta navegación y
   concentra conflictos.
2. **Crear un archivo por caso:** maximiza aislamiento, pero produce 126 archivos y
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

## Consecuencias

- La navegación y las revisiones quedan acotadas al grupo afectado.
- Frontend y backend mantienen fuentes canónicas independientes y simétricas.
- Las reglas comunes no se repiten en los capítulos.
- El exportador y el verificador deben conocer el orden de la colección.
- Agregar otro grupo exige actualizar ambos índices, el manifiesto y la validación de
  cobertura.
