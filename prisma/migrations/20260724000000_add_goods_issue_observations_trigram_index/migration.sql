-- Speed up case-insensitive contains searches over goods issue observations.
-- Prisma translates `contains` with `mode: 'insensitive'` to ILIKE, which can use
-- a trigram GIN index for `%term%` patterns in PostgreSQL.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "GoodsIssue_observations_trgm_idx"
ON "GoodsIssue"
USING GIN ("observations" gin_trgm_ops);
