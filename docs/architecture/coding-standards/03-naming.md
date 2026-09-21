# 3. Nomenclatura

### 3.1 Reglas generales

- Nombres de variables, funciones y propiedades JavaScript usan `camelCase`.
- Clases y tipos conceptuales usan `PascalCase`; las clases de error mantienen el
  sufijo `Error`.
- Constantes inmutables que representan catálogos, configuración global o valores
  compartidos usan `UPPER_SNAKE_CASE`. Una referencia `const` local a un objeto o
  servicio conserva `camelCase` si su identidad no es una constante de dominio.
- Los nombres están en inglés para coincidir con el código vigente. Texto visible,
  mensajes funcionales y documentación pueden estar en español.
- No se crean abreviaturas nuevas salvo las asentadas en el proyecto (`DTO`, `API`,
  `URL`, `DOM`, `JWT`). Dentro de `camelCase`, se escriben como palabra: `apiRoute`,
  `userDto`, `databaseUrl`.
- El nombre expresa propósito, no implementación incidental. Se evita `data`, `item`,
  `value`, `temp` o `handler` cuando el dominio permite un nombre preciso.

### 3.2 Funciones, booleanos y colecciones

- Una función inicia con un verbo que describe su efecto: `find`, `get`, `create`,
  `register`, `update`, `edit`, `remove`, `validate`, `normalize`, `map`, `format` o
  `render` según corresponda.
- Los booleanos expresan una pregunta o estado mediante `is`, `has`, `can`, `should` o
  `requires`. No se usa una negación doble.
- Las colecciones se nombran en plural; un registro individual, en singular.
- Los callbacks breves pueden usar nombres convencionales como `req`, `res`, `next`,
  `tx` o `event`. Fuera de esos contratos se prefiere el nombre completo.
- Una función que construye otra capacidad utiliza `create<Capacidad>`; una que adapta
  datos utiliza `map`, `normalize` o `format`, no `create` si no crea una entidad.

### 3.3 Archivos y directorios

- Archivos JavaScript usan `camelCase.js`, salvo clases cuyos archivos conservan el
  nombre `PascalCase.js`, como `AppError.js`.
- Directorios usan `camelCase` y representan dominio o responsabilidad, no una sola
  función accidental.
- Sufijos comunican la capa: `Controller`, `Service`, `Repository`, `Route`, `DTO`,
  `Validation`, `Middleware`, `Utils` y `Test` se usan únicamente cuando el archivo
  cumple esa responsabilidad.
- Las rutas web y API conservan `WebRoute.js` y `ApiRoute.js`. Las integraciones con BD
  terminan en `ControllerDbTest.js`.
- No se crea un archivo barril `index.js` sólo para acortar imports. Un `index.js`
  existente representa un punto real de composición o registro.
