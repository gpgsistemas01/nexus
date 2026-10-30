# 6. Funciones, flujo y asincronía

## Unidad de responsabilidad

Una función expresa una operación reconocible. Separar validación de captura, mapeo,
transporte y confirmación cuando tienen entradas, efectos o motivos de cambio distintos.
Preferir guardas tempranas para permisos, estado pendiente o desmontaje antes de iniciar
un efecto. No anidar decisiones de dominio dentro del renderizado de una celda.

Nombrar la condición de una rama compleja o extraer una función pura si representa una
regla reutilizable. Una extracción no se justifica por delegar una única llamada sin
conservar un contrato o proteger una frontera.

## Parámetros y contexto

Agrupar en un objeto tipado los datos que describen una misma consulta. Conservar
`AbortSignal` separado: controla la ejecución y no es un filtro. El consumidor
aporta el contexto de su pantalla; el servicio lo traduce al contrato HTTP.

Ejemplo de [usePurchaseEditor](../../../src/modules/purchases/composables/usePurchaseEditor.ts):

```ts
purchaseLookupService.list(
    { kind: 'suppliers', resource: options.resource, search, page, capture: true },
    signal,
);
```

Al componer colaboradores, pasar los campos y callbacks que declara el receptor.
Evitar reenviar todas las props o todo el editor mediante un spread cuando sólo
se necesita una parte. En [useUserEditor](../../../src/modules/identity/composables/useUserEditor.ts),
el guardado recibe confirmación, rechazo y errores; la selección y los permisos
permanecen en el editor:

```ts
const save = useRecordSave({
    onSaved: options.onSaved,
    onDenied: options.onDenied,
    setErrors: form.setErrors,
});
```

## Efectos y promesas

Esperar las operaciones que deben completar antes de continuar. `void` sólo expresa
que un efecto deliberado es atendido por su coordinador de errores. Un callback de
confirmación se ejecuta después de validar la respuesta, y sólo si su consumidor sigue
vigente. `try/catch` traduce o recupera un fallo concreto; `finally` libera pendiente.

Las lecturas reciben `AbortSignal`. Cambio de contexto y desmontaje abortan o invalidan
la petición y descartan respuestas anteriores. `usePagedList` utiliza además secuencia
de solicitud: abortar no sustituye la protección frente a respuestas que ya llegaron.
No confirmar un formulario desmontado ni sustituir filas nuevas con una consulta vieja.

### Ejemplo de lectura vigente y desmontaje

Fragmento de `load` en
[useDocumentRead.ts](../../../src/shared/composables/useDocumentRead.ts):

```ts
const result = await options.request(id, current.signal);
if (attempt !== sequence || current.signal.aborted) return;

document.value = result;
return result;
```

`attempt` identifica la solicitud; `sequence` cambia al reemplazarla o cerrar la
lectura. La guarda permite publicar sólo el resultado vigente. El mismo composable
registra la limpieza:

```ts
onBeforeUnmount(() => {
    isDisposed = true;
    close();
});
```

`close` invalida la secuencia y aborta la petición. La implementación completa
conserva `catch` para comunicar el fallo y `finally` para liberar el pendiente sólo
si corresponde a esa lectura.

## Reintentos

Las escrituras no se repiten automáticamente por un fallo de red. El cliente HTTP
coordina una renovación ante 401 y reintenta una vez la petición protegida; no renueva
un login rechazado. La merma conserva `operationId` en el reintento de su captura
incierta, conforme a su contrato específico.

## Recursos

Timers, listeners, controladores y montajes se liberan con el ciclo de vida de su dueño.
`useVisibleRefresh` retira foco/visibilidad e intervalo al desmontar; no instalar otro
sondeo por componente de tabla. La recarga en segundo plano respeta visibilidad,
intervalo, estado pendiente y editor abierto según el consumidor.

## Resultado observable

Una función de lectura devuelve datos tipados o falla; una mutación sólo se confirma
con su código contractual. No devolver `[]`, cero o éxito por defecto para ocultar un
fallo de contrato. Cancelación esperada y rechazo de negocio se distinguen de errores
inesperados para presentar recuperación sin destruir la captura.
