# 8. Errores y confirmación de resultados

## Frontera HTTP

Usar `apiClient` para solicitudes JSON/blob y la normalización `ApiError`. No crear
otra instancia Axios por formulario. El cliente rechaza respuestas JSON inesperadas;
los adaptadores de recurso comprueban campos/códigos. `confirmMutation` compara con
el código permitido por operación antes de anunciar éxito.

| Situación | Respuesta del cliente |
| --- | --- |
| Captura inválida | Mensaje por campo y ninguna escritura desde el formulario. |
| 400 con errores de campo | Aplicar errores admitidos al formulario y mantener captura. |
| 401 protegido | Una renovación coordinada; rechazo definitivo deriva a login con retorno interno. |
| 403 | Presentar acceso no permitido y reevaluar permisos vigentes. |
| Conflicto de versión | Conservar captura, impedir reenvío y exigir nueva lectura. |
| Red/5xx/contrato inválido | Mostrar recuperación; no inventar éxito ni repetir escrituras en bucle. |
| Cancelación/desmontaje | No notificar éxito ni modificar un consumidor posterior. |

### Ejemplo de confirmación contractual

Fragmento de `confirmMutation` en
[recordContract.ts](../../../src/shared/http/recordContract.ts):

```ts
export const confirmMutation = (
    value: unknown,
    expected: string,
    errorMessage = 'No se pudo confirmar la operación. Actualiza el listado antes de reintentar.',
): MutationConfirmation => {
    if (!isRecord(value) || value.code !== expected) {
        throw new ApiError(errorMessage);
    }

    return { code: value.code, message: getSuccessMessage(value.code) };
};
```

El código `expected` procede del catálogo de la operación. Una respuesta HTTP exitosa
con un código distinto produce un error y detiene la confirmación. En
[directoryService.save](../../../src/modules/directory/services/directoryService.ts),
esta comprobación precede a la normalización y devolución del registro; el
coordinador comunica el éxito después de que el servicio termine correctamente.

## Descargas y recursos

Para Excel, comprobar respuesta y tipo antes de descargar; un HTML del proxy no es
un archivo válido. Liberar las URLs de blob al terminar mediante el helper compartido.

## Presentación del resultado

Reutilizar `shared/ui/feedback.ts` y conservar la distinción entre error de campo,
rechazo de negocio, cancelación y fallo inesperado. Un callback o aviso de éxito sólo
se produce tras confirmar el resultado. El [estándar de interfaz](../interface-standards.md)
define su interacción; el [de seguridad](../security-standards.md), la presentación
segura de texto y el tratamiento de credenciales.
