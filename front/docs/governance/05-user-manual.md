# 5. Mantener el manual de usuario

## Audiencia y alcance

El [manual](../user-manual/index.md) enseña las tareas de la interfaz Vue paso a
paso. Cada capítulo agrupa una página o familia de tareas e incluye preparación,
campos, pasos, resultado e incidencias. Las etiquetas y capturas corresponden a
las pantallas actuales; la persona que lo lee no necesita conocimientos técnicos.

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

Al cambiar una pantalla, actualizar el procedimiento y la imagen afectados.
Mantener las advertencias junto a la acción y los términos del negocio en el
glosario. No trasladar al manual nombres de contratos o patrones técnicos.
Las instrucciones de surtido y devolución se incluyen sólo en ediciones con ese
permiso; el generador filtra los bloques del manual y del glosario por acceso.

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

Las imágenes de otros capítulos se conservan. Antes de publicar, ejecutar el
conjunto completo y revisar los cambios en las imágenes. Ante un fallo, corregir
la preparación o el selector; no omitir la captura requerida ni cambiar la
aplicación para obtenerla. El reporte queda en
`front/build/test-results/manual.xml`; los rastros de fallo son artefactos ignorados.

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
