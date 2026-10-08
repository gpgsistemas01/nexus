# 5. Resultado de la revisión vigente

La revisión documental encontró y trató estas brechas:

| Hallazgo | Tratamiento vigente | Seguimiento |
| --- | --- | --- |
| Casos con verbos amplios («administrar», «mantener»). | Se separaron en objetivos `CU-*` observables; las familias sólo comparten contexto. | Verificar igualdad de IDs entre catálogo y diagramas al cambiar casos. |
| Requisitos extensos que mezclan obligación, diseño y numerosos escenarios. | Se adoptó una obligación por operación observable en todos los paquetes; los criterios `CA-*` conservan variantes del mismo resultado. | Revisar la granularidad con la misma regla cuando cambie cualquier requisito, sin crear una obligación por campo. |
| Evidencia mezclada con la formulación normativa. | La evidencia permanece en columna propia y el mapa generado conserva rutas/importaciones. | Rechazar nuevas filas que describan archivos dentro de la obligación. |
| Calidad sin valores medidos. | Rendimiento y disponibilidad permanecen propuestos. | Definir propietario, línea base, umbral y prueba antes de marcarlos implementados. |
| Visión con exclusiones obsoletas y detalle de implementación. | Se alineó el alcance de los seis catálogos auxiliares; se expresaron objetivos, interesados, dependencias y calidad desde el negocio. | Resolver las decisiones pendientes de visión sin atribuir aceptación ni certificación ISO. |
| Vocabulario incompleto o confundido entre persona y cuenta. | Se distinguieron responsabilidad y acceso; se incorporaron conceptos del dominio, estados, trazabilidad y alcance. | Revisar términos al cambiar una regla; no duplicar el diccionario de campos técnicos. |
| Efectos extensos o dependientes de implementación. | Se resumieron con nombres de negocio y cambios de cantidad en una tabla compartida por las máquinas de estado. | Conservar guardas y enlaces a las reglas normativas sin introducir código en el diagrama. |
| Ausencia de responsable formal de aprobación. | El estado refleja evidencia técnica, no aceptación funcional. | Registrar responsable y aprobación en la incidencia o solicitud de cambio. |

### Auditoría de granularidad por tipo

| Tipo | Decisión aplicada | Ejemplos de separación |
| --- | --- | --- |
| `RF-*` funcional | Una operación o resultado observable por requisito. | Iniciar/renovar/cerrar sesión; consultar/crear/editar; surtir/devolver. |
| `RD-*` datos | Una garantía persistente que puede comprobarse de forma independiente. | UUID, precisión decimal, relaciones, historia, fechas y estados. |
| `RN-*` negocio | Una restricción transversal por posible incumplimiento. | Autenticación, autorización y validación de entrada tienen IDs distintos. |
| `RC-*` calidad | Un atributo y mecanismo de comprobación por requisito. | Hash, rutas protegidas, aislamiento de pruebas, logs, runtime y despliegue. |

La revisión no divide listas de atributos inseparables de una misma identidad ni los
participantes de una misma transacción atómica. Esos detalles permanecen como condición
o criterio de aceptación del requisito propietario.
