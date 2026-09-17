# 5. Versionado

Sistema y documentación evolucionan de forma relacionada, pero no comparten número por fuerza:

- **Sistema:** SemVer `MAYOR.MENOR.PARCHE`; MAYOR rompe contratos, MENOR agrega capacidad
  compatible y PARCHE corrige sin cambiar el contrato intencional.
- **Documento:** `MAYOR.MENOR`; MAYOR cambia estructura, alcance aprobado o interpretación
  normativa; MENOR aclara, agrega evidencia o sincroniza comportamiento sin redefinir alcance.
- Un documento registra la versión del sistema que describe. Un cambio funcional debe elevar la
  versión documental del paquete afectado; cambios sólo editoriales no elevan la del sistema.
- Estados: `Borrador`, `En revisión`, `Aprobado` y `Obsoleto`. Sólo una versión aprobada se trata
  como línea base. Git conserva el historial; la portada y el control de cambios expresan la
  línea base para lectores externos.
