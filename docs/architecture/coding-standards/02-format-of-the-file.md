# 2. Formato del archivo

### 2.1 Indentación

- Se usan espacios, nunca tabuladores.
- El código bajo `src`, `scripts` y archivos de configuración usa cuatro espacios por
  nivel.
- Las pruebas bajo `tests` usan dos espacios por nivel para conservar la convención de
  sus suites.
- El contenido de un bloque aumenta exactamente un nivel. Un cierre queda alineado con
  la construcción que abrió el bloque.
- En expresiones multilínea, los elementos hermanos comparten columna o nivel. No se
  alinean manualmente con grupos variables de espacios, porque una edición cercana
  rompería esa alineación.
- En EJS, la indentación representa la estructura HTML resultante. Las directivas EJS
  se alinean con el elemento o bloque al que pertenecen.

### 2.2 Líneas, espacios y fin de archivo

- Cada archivo de texto termina con una sola nueva línea. No se agregan líneas vacías
  adicionales al final.
- No quedan espacios al final de una línea ni líneas que sólo contengan espacios.
- Se usa una línea vacía entre imports y declaraciones de módulo, entre funciones de
  nivel de módulo y entre fases semánticas de una función.
- No se coloca una línea vacía inmediatamente después de abrir una función, condición,
  ciclo u objeto, ni inmediatamente antes de cerrarlo.
- No se separa con una línea vacía una declaración de su uso inmediato, cada propiedad
  de un objeto ni cada sentencia de un mismo paso.
- Una línea extensa se divide por unidades semánticas: argumentos, propiedades, imports
  nombrados o condiciones. No se introduce un límite rígido que obligue a fragmentar
  rutas, mensajes o identificadores indivisibles; una línea debe poder revisarse sin
  desplazamiento horizontal cuando exista un corte natural.
- Cada sentencia JavaScript termina en punto y coma.
- Se deja un espacio después de coma y alrededor de operadores binarios. No hay espacio
  entre nombre de función y `(`, ni dentro de paréntesis, corchetes o llaves vacías.

### 2.3 Comillas, plantillas y literales

- Cada archivo mantiene una sola convención para strings ordinarios; al modificarlo se
  conserva la predominante. No se cambian comillas sólo por estilo.
- Los template literals se reservan para interpolación o texto multilínea; no sustituyen
  una cadena estática.
- Los números, estados, permisos, selectores, nombres de eventos y mensajes compartidos
  se importan desde constantes. Un literal local permanece local si pertenece a una
  única operación y no expresa una regla reutilizable.
- No se concatenan fragmentos cuando un template literal hace explícita la intención.

### 2.4 Ejemplo de formato

El ejemplo conserva cuatro espacios en código de aplicación, divide una condición por
unidades semánticas y separa la guarda del recorrido normal:

```js
const findActiveMaterial = async ({ materialId, warehouseId }) => {
    if (!materialId || !warehouseId) return null;

    const material = await findMaterial({
        materialId,
        warehouseId
    });

    return material?.isActive ? material : null;
};
```

No se alinea `warehouseId` con espacios variables ni se reemplaza la guarda por un
bloque anidado. En una prueba equivalente se usan dos espacios por nivel.
