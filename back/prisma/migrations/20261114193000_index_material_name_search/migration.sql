-- Complementa las búsquedas contains/ILIKE sin alterar su significado ni identidad.
-- pg_trgm ya forma parte del historial para las observaciones de salidas.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Material_name_trgm_idx"
ON "Material" USING GIN ("name" gin_trgm_ops);
