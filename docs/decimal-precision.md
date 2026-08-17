# Política de precisión decimal

## Decisión

La base de datos conserva los valores decimales con `DECIMAL(18,6)`. Los seis
decimales evitan acumular pérdidas al convertir unidades, calcular superficies,
actualizar existencias o encadenar movimientos. Redondear cada resultado intermedio a
dos decimales puede hacer que la suma de los movimientos deje de coincidir con la
existencia calculada.

La interfaz muestra importes, medidas y cantidades con dos decimales mediante los
formatters compartidos. Este formato es una decisión de presentación y no modifica el
valor enviado al API ni el persistido. Los cálculos de frontend y backend se
normalizan a seis decimales antes de persistirse; cuando una regla de negocio requiera
centavos, debe solicitar explícitamente dos decimales al helper de redondeo.

## Alcance y compatibilidad

La migración amplía precisión y escala, por lo que no descarta los datos existentes.
Se aplica de forma uniforme a las columnas `DECIMAL(10,2)` para evitar que un detalle
conserve precisión mientras su saldo, movimiento o historial la pierda. El formato de
lectura permanece en dos decimales y, por tanto, no introduce un cambio visual en las
vistas.

Después de ampliar las columnas, una segunda migración reconstruye los metros cuadrados
calculados en entradas, salidas, mermas y existencias a partir de la cantidad, base y
altura persistidas. También vuelve a calcular el costo unitario convertido y las
diferencias contra la cantidad del proyecto. Los valores capturados originalmente con
dos decimales no pueden recuperar decimales que nunca fueron almacenados; la
reconstrucción sí recupera los seis decimales del resultado de multiplicar esos datos.

La misma reconstrucción actualiza los importes netos y brutos de cada entrada, sus
totales de encabezado, el historial de correcciones y el costo unitario máximo vigente
por proveedor y material. Los importes se derivan nuevamente de cantidad y costo; el
IVA se calcula sobre el importe neto ya normalizado, igual que en el CRUD. Así se evita
que los metros cuadrados con seis decimales convivan con costos derivados que todavía
conserven el redondeo anterior.

Cuando no existen ambas medidas positivas —incluidos valores nulos, cero o una sola
medida capturada— no se calculan metros cuadrados. En esos casos se conserva la
cantidad en su unidad original como `convertedQuantity`, que es la misma regla usada
por los CRUD de entradas, salidas y mermas. La migración aplica explícitamente esta
alternativa y no multiplica dimensiones incompletas.

Los detalles históricos no guardan una instantánea de base y altura. Por ello, la
reconstrucción usa las dimensiones vigentes del material o merma relacionado, igual que
el proceso existente que recalcula existencias cuando se editan dimensiones. Esta
limitación debe considerarse si se necesita auditar dimensiones históricas.

## Normalización en JavaScript

`roundTo` sigue siendo necesario aunque PostgreSQL limite la columna a seis decimales.
JavaScript realiza las operaciones con punto flotante binario y puede producir residuos
como `0.1 + 0.2 = 0.30000000000000004`. El helper normaliza esos resultados antes de
compararlos, acumularlos o enviarlos desde los CRUD al API. No sustituye la precisión de
la base de datos ni se utiliza para reducir la presentación a dos decimales; esa tarea
corresponde exclusivamente a `formatDecimal` y `formatCurrency`.

JavaScript sí incluye `Number.prototype.toFixed`, y `roundTo` lo reutiliza. No se usa
directamente en cada CRUD porque `toFixed` devuelve una cadena y repetir la conversión
de entrada y salida dispersaría la política de seis decimales. El helper compartido
aplica `Number.EPSILON`, delega el redondeo a `toFixed` y devuelve nuevamente un número.
`Intl.NumberFormat` se reserva para presentación porque también produce texto localizado.

Las cantidades proporcionales de surtidos y devoluciones se calculan con el helper
compartido `calculateProportionalConvertedQuantity`. Así, entradas parciales como un
tercio se normalizan una sola vez a seis decimales antes de actualizar movimientos y
existencias, en lugar de repetir divisiones de punto flotante en cada flujo.

Ese helper se necesita porque un surtido o una devolución puede mover sólo una fracción
del detalle original. Distribuye la `convertedQuantity` guardada en el detalle según
`partialQuantity / totalQuantity`; de ese modo utiliza la conversión histórica del
documento y no vuelve a calcularla con dimensiones que pudieron cambiar después. El
mismo contrato se reutiliza al surtir y al devolver merma.

## Matriz de aplicación

En esta política, «valor exacto» significa el valor operativo normalizado y persistido
con hasta seis decimales; no significa precisión matemática ilimitada.

| Etapa | Datos | Tratamiento |
| --- | --- | --- |
| Captura | cantidad, costo, base, altura y cantidad de proyecto | Se conserva el valor recibido; no se reduce a dos decimales en la UI. |
| Cálculo de entradas | importe neto/bruto, metros cuadrados y costo por unidad convertida | `roundTo` normaliza a seis decimales y el backend vuelve a calcular antes de persistir. |
| Inventario | existencias, movimientos, diferencias, surtidos y devoluciones proporcionales | `normalizeDecimal` o los helpers de inventario normalizan a seis decimales. |
| Reportes | IVA, costo por metro cuadrado y totales calculados | `roundTo` entrega resultados numéricos con hasta seis decimales. |
| Persistencia y reconstrucción | columnas `DECIMAL(18,6)` y datos derivados históricos | PostgreSQL conserva seis decimales; las migraciones reconstruyen y redondean a esa escala. |
| Presentación | tablas, resúmenes y modales de consulta | `formatDecimal` y `formatCurrency` muestran dos decimales sin cambiar el valor operativo. |

Por ejemplo, un cálculo de `44.253432` se conserva como valor operativo y el backend lo
almacena como `44.253432`, mientras que una celda de la interfaz lo representa como
`44.25`. El texto mostrado nunca debe reutilizarse como fuente de una actualización; los
CRUD conservan los operandos recibidos o recalculan el resultado a partir de ellos.

## Frontera entre frontend y backend

El frontend puede calcular `44.253432` para mantener consistente el estado del formulario,
pero únicamente muestra `44.25`. Al enviar entradas, salidas o mermas, los DTO aceptan
los operandos capturados —por ejemplo cantidad, costo e identificadores— y descartan
`convertedQuantity`, importes y costos derivados que pudiera incluir el navegador.

El backend consulta las medidas vigentes y vuelve a calcular el valor operativo con seis
decimales. Por tanto, la cantidad redondeada a dos decimales es exclusivamente visual y
nunca es la fuente de persistencia. Esta separación también impide que un cliente altere
un importe o una cantidad convertida enviando un cálculo diferente al del servidor.

Los normalizadores de los formularios aplican esta frontera antes de llamar al API. Las
entradas envían por detalle únicamente `materialId`, `quantity` y `costPerUnitType`; las
salidas envían identificadores, presentación y cantidad. Los importes neto/bruto,
`conversionUnitCost`, `maxUnitCost`, metros cuadrados y diferencias permanecen en el
estado local sólo para construir la vista previa y no forman parte del payload.

## Impacto de rendimiento

El recálculo del backend no agrega una consulta por detalle. En entradas y salidas, los
materiales necesarios se obtienen en una sola consulta, se indexan en un `Map` y los
importes o conversiones se calculan en memoria en tiempo lineal respecto al número de
detalles. En mermas se usa igualmente una consulta `findMany` por documento. Esta forma
evita el patrón N+1 y mantiene al servidor como fuente autoritativa con un costo acotado.

Una corrección opera sobre un solo detalle y actualiza detalle, encabezado, historial e
inventario dentro de la misma transacción. Después ejecuta una consulta agregada para el
costo máximo del material afectado. Es trabajo necesario para conservar consistencia y
no depende del número total de materiales del catálogo.

Las reconstrucciones masivas pertenecen exclusivamente a la migración: no se ejecutan
en cada solicitud. Como actualizan tablas completas, deben aplicarse durante la ventana
de despliegue prevista para migraciones. No se define un umbral artificial de tiempo
porque el plan de pruebas aún requiere métricas y un ambiente de volumen acordados para
aceptar objetivos de rendimiento.
