-- Rangos de fecha de movimientos y reportes. PostgreSQL puede conservar un escaneo
-- secuencial cuando el rango comprende una parte amplia del historial.
CREATE INDEX "InventoryMovement_date_idx" ON "InventoryMovement" ("date");
CREATE INDEX "WasteMovement_date_idx" ON "WasteMovement" ("date");
