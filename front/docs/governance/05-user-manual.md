# 5. Mantener el manual de usuario

## Audiencia y alcance

El [manual](../user-manual/index.md) enseña cada tarea paso a paso, sin conocimientos
técnicos. Cada capítulo incluye preparación, campos, pasos, resultado e incidencias; sus
etiquetas y capturas corresponden a las pantallas actuales.

Mantener una fuente por tarea. Los pasos describen la acción; las notas adicionales
se limitan a consecuencias, restricciones o recuperación que no quedan claras en ellos.

Las ediciones se generan por cuenta y muestran sus áreas y roles. Para entregar
manuales, seguir el [procedimiento por cuenta](07-manual-accounts-and-files.md).

## Fuentes y alcance de publicación

| Fuente | Uso |
| --- | --- |
| `front/docs/user-manual/index.md` y capítulos numerados | Instrucciones para el usuario. |
| [Glosario de operación](../user-manual/16-glossary.md) | Términos visibles y ejemplos de captura, contrastados con el [glosario de negocio](../requirements/business-glossary.md). |
| `front/docs/user-manual/images/*.png` | Capturas generales de referencia, generadas y revisadas por separado; los archivos nuevos están ignorados por Git. |
| Sección `manual` de [publications.json](../publications.json) | Entrada propia, excluida del libro técnico completo. |
| [Configuración Playwright](../../playwright.manual.config.ts) y [recorridos](../../tests/manual/manualScreenshots.spec.ts) | Generación de capturas de referencia. |

Actualizar procedimiento y captura junto a la pantalla. Mantener advertencias junto a la
acción y términos de negocio en el glosario, sin contratos o patrones técnicos. El
generador filtra manual y glosario por permisos, incluidos surtido y devolución.

| Grupo de la edición | Fuentes compartidas |
| --- | --- |
| Para empezar | Inducción, acceso y controles comunes. |
| Sus tareas | Capítulos por módulo y bloques de acciones filtrados por permiso. |
| Ayuda y consulta | Recuperación y glosario, también filtrados. |

Los bloques `manual:any` y `manual:all` deben abarcar título, pasos, notas e imágenes
de la acción. Las referencias a reportes y ajustes se filtran también fuera de su capítulo.

## Generar capturas por cuenta

La generación se ejecuta sólo en desarrollo local, con las dependencias de desarrollo
y el Chromium de Playwright instalados en ese equipo.

`npm run docs:screenshots -- --all` lee las cuentas y credenciales locales y
guarda imágenes separadas por usuario. La preparación, selección de cuentas y
rutas están en el [procedimiento por cuenta](07-manual-accounts-and-files.md).

## Actualizar capturas de referencia

Desde `front/`:

```bash
npm ci --include=dev
npx playwright install chromium
npm run docs:screenshots:reference
```

Playwright inicia Vite en `http://127.0.0.1:5176`; el puerto debe estar libre.
No requiere API, cuentas ni base de datos. Para usar un Chromium instalado,
configurar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Los recorridos usan registros ficticios existentes y API simulada. Bloquean
peticiones no simuladas y métodos distintos de GET; la comprobación final exige
cero intentos de escritura. Se pueden abrir formularios o modificar borradores,
sin confirmar operaciones. La devolución parte de una salida ya surtida; la
edición, de un registro existente. Las contraseñas permanecen vacías.

Para revisar un recorrido concreto:

```bash
npm run docs:screenshots:reference -- --grep "compras:"
```

Conservar las imágenes de otros capítulos y ejecutar el conjunto completo antes de
publicar. Ante fallos, corregir preparación o selector sin omitir capturas ni cambiar la
aplicación. El reporte es `front/build/test-results/manual.xml`; las trazas permanecen
ignoradas.

## Comprobar y exportar

```bash
npm run docs:check
npm run docs:manuals -- --all
```

El comando genera una edición por cuenta configurada. `docs:manual:reference -- ambos` reúne
todas las tareas en una referencia para mantenimiento; no es la edición por usuario.
`docs:check` verifica enlaces y referencias de imagen sin iniciar el navegador ni
exigir las capturas generadas. La exportación exige las imágenes del manual. Las rutas de
salida y la revisión de Word/PDF están en
[generación y publicación](02-generation-and-publication.md).

Contrastar pasos, etiquetas y permisos con Vue. Las capturas simuladas muestran
la interfaz; la persistencia y los permisos efectivos se verifican en sus pruebas.
Distribuir los documentos revisados sin datos reales ni credenciales. Fuentes,
imágenes y resultados permanecen fuera del despliegue.
