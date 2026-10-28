# Estados de documento y captura

Los modelos se organizan por responsabilidad en [estados de interacción y captura](states/index.md):

- [Compras](states/01-purchases.md): consulta, edición, corrección y cancelación.
- [Salidas](states/02-issues.md): lectura, resolución de modo, rechazo y reintento.
- [Merma](states/03-waste-capture.md): pendiente local, incertidumbre y confirmación.

Cada figura conserva su identificador y fuente. Los estados representan interacción;
la API conserva la autoridad sobre estado persistido, permisos y efectos de inventario.
