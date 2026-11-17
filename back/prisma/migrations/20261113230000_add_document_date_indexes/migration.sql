-- Los filtros de fecha usan rangos sobre la columna original (sin DATE/TRUNC).
-- El tipo encabeza el índice de compras/salidas; id conserva el desempate del cursor.
CREATE INDEX "GoodsReceipt_type_receptionDate_id_idx"
ON "GoodsReceipt" ("type", "receptionDate", "id");

CREATE INDEX "GoodsIssue_type_requestDate_id_idx"
ON "GoodsIssue" ("type", "requestDate", "id");
