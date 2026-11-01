# 5. Mantener el manual de usuario

## Audiencia y alcance

El [manual](../user-manual/index.md) enseña cada tarea paso a paso, sin conocimientos
técnicos. Cada capítulo incluye preparación, campos, pasos, resultado e incidencias; sus
etiquetas y capturas corresponden a las pantallas actuales.

Este capítulo mantiene la fuente completa y sus capturas ficticias. Para obtener
una edición con el acceso de una cuenta, seguir el
[procedimiento por cuenta](07-manual-accounts-and-files.md).

## Fuentes y alcance de publicación

| Fuente | Uso |
| --- | --- |
| `front/docs/user-manual/index.md` y capítulos numerados | Instrucciones para el usuario. |
| [Glosario de operación](../user-manual/16-glossary.md) | Términos visibles y ejemplos de captura, contrastados con el [glosario de negocio](../requirements/business-glossary.md). |
| `front/docs/user-manual/images/*.png` | Capturas fuente, versionadas junto al texto. |
| Sección `manual` de [publications.json](../publications.json) | Entrada propia, excluida del libro técnico completo. |
| [Configuración Playwright](../../playwright.manual.config.ts) y [recorridos](../../tests/manual/manualScreenshots.spec.ts) | Generación de capturas de referencia. |

Actualizar procedimiento y captura junto a la pantalla. Mantener advertencias junto a la
acción y términos de negocio en el glosario, sin contratos o patrones técnicos. El
generador filtra manual y glosario por permisos, incluidos surtido y devolución.

## Generar las capturas

Desde `front/`:

```bash
npm ci --include=dev
npx playwright install chromium
npm run docs:screenshots
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
npm run docs:screenshots -- --grep "compras:"
```

Conservar las imágenes de otros capítulos y ejecutar el conjunto completo antes de
publicar. Ante fallos, corregir preparación o selector sin omitir capturas ni cambiar la
aplicación. El reporte es `front/build/test-results/manual.xml`; las trazas permanecen
ignoradas.

## Comprobar y exportar

```bash
npm run docs:check
npm run docs:manual -- ambos
```

`docs:export -- manual pdf` exporta sólo PDF. `docs:check` verifica enlaces e
imágenes sin iniciar el navegador. Los requisitos del publicador, las rutas de
salida y la revisión de Word/PDF están en
[generación y publicación](02-generation-and-publication.md).

Contrastar pasos, etiquetas y permisos con Vue. Las capturas simuladas muestran
la interfaz; la persistencia y los permisos efectivos se verifican en sus pruebas.
Distribuir los documentos revisados sin datos reales ni credenciales. Fuentes,
imágenes y resultados permanecen fuera del despliegue.
