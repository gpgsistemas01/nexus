# 7. Objetos, colecciones y payloads

## Fronteras de datos

Distinguir datos recibidos, contrato de dominio y valores de formulario. El servicio
comprueba el DTO y el mapper traduce los campos; TypeScript no valida JSON en ejecución.
Las respuestas incompletas se rechazan como contrato inválido. Un listado vacío válido
no equivale a una respuesta sin sus conteos obligatorios.

## Captura numérica

Durante edición un campo puede conservar texto para representar vacío, separador o una
captura incompleta. La conversión ocurre en la frontera apropiada después de validar;
no aplicar `Number(value) || 0`, que vuelve indistinguibles ausencia, error y cero.
Usar las utilidades numéricas públicas del proyecto y las fronteras de cada esquema.
Costo ausente y costo cero no se interpretan como el mismo estado.

## Lista explícita por operación

Los mappers seleccionan sólo campos admitidos. No enviar un objeto reactivo completo
mediante spread: puede incluir etiquetas, stock leído, permisos o resultados derivados.
Alta, encabezado, corrección, surtido y devolución tienen contratos diferentes.
Los discriminantes tipados impiden combinar consulta con escritura o cancelación con
campos propios de una corrección.

`expectedVersion` procede de la lectura que originó la captura. No obtener otra versión
antes de enviar para aceptar silenciosamente una edición antigua. Cuando corresponde,
conservar también `expectedMaterialVersion`. Una creación no fabrica una versión.
`operationId` identifica el intento de merma que se recupera, no la identidad inventada
de una entidad seleccionable.

### Ejemplo de payload por recurso y operación

Fragmento de [directory.ts](../../../src/modules/directory/directory.ts):

```ts
export const directoryPayload = (
    resource: DirectoryResource,
    target: DirectoryTarget,
    values: DirectoryValues,
) => ({
    ...(resource === 'clients'
        ? { name: values.name.trim() }
        : { legalName: values.legalName.trim(), tradeName: values.tradeName.trim() }),
    isActive: values.isActive,
    ...(target.action === 'edit' ? { expectedVersion: target.row.version } : {}),
});
```

Los spreads combinan objetos con campos seleccionados explícitamente. El formulario
completo no se envía. Con nombre `  Cliente ejemplo  `, estado activo y versión leída
4, los resultados para Clientes son:

| Operación | Payload |
| --- | --- |
| Crear | `{ name: 'Cliente ejemplo', isActive: true }` |
| Editar | `{ name: 'Cliente ejemplo', isActive: true, expectedVersion: 4 }` |

El ID de edición se incorpora a la URL en
[directoryService.ts](../../../src/modules/directory/services/directoryService.ts);
la versión permanece en el payload para detectar cambios concurrentes.

## Colecciones y selección

Las listas se paginan en servidor. El índice visible de columna se traduce mediante
el mapa admitido por el recurso; no asumir que todas las tablas tienen columnas contiguas.
`useSelectedOption` conserva etiqueta/datos mientras el ID sigue seleccionado y actualiza
la opción cuando llega información remota más reciente. Limpiar o cambiar el ID descarta
la selección anterior. Deduplicar opciones por identidad sin detener la paginación por
el número de resultados únicos.

## Derivados

Totales, conversiones, pesos y saldos del navegador son vistas previas. Las escrituras
no envían derivados como autoridad del stock o del permiso. Después de una confirmación,
recargar o usar el resultado contractual para reflejar los datos vigentes. Las
observaciones del documento y de sus movimientos no se fusionan en un campo local.
