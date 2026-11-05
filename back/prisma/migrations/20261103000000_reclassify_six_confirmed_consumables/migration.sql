-- Data-only correction from LISTA CONSUMIBLES.pdf, checked against the
-- 2026-10-27 backup. No schema change or historical document rewrite is needed.
-- Match the six reviewed IDs and their catalog identity; never match by name alone.
-- Missing/changed records are left untouched, including on a fresh installation.
UPDATE "Material" AS material
SET "type" = 'CONSUMABLE'
FROM (VALUES
    ('e1a442d3-7fa8-47f7-b606-303294607c0b'::uuid, 'PLAYO', 'PLA-1'),
    ('7dd8df51-b784-4f3e-9ecf-645e2c71931a'::uuid, 'HULE BURBUJA', 'HUL-BUR-1'),
    ('dccb3ce9-d514-4993-b67f-0e5eb6b6fb1b'::uuid, 'PAPEL KRAFT', 'PAP-KRA-1'),
    ('7eab9db1-64f4-4016-ada3-73d842ccc463'::uuid, 'MALLA VERDE', 'MAL-VER-1'),
    ('fdb3c7f0-558f-45df-8608-ea8f877c933f'::uuid, 'KOLA LOKA KLM - 2000', 'KOL-LOK-KLM-2000-1'),
    ('dcb5c66f-5fca-47f2-9e75-166f9427c2da'::uuid, 'KOLA LOKA KL2 - 1200', 'KOL-LOK-KL2-1200-1')
) AS confirmed("id", "name", "sku")
WHERE material."id" = confirmed."id"
    AND material."name" = confirmed."name"
    AND material."sku" = confirmed."sku"
    AND material."presentationId" = '9c60a860-90dc-4f8e-bee0-d0c92928695c'::uuid
    AND material."unitMeasureId" = '3cbf98f2-5502-477d-bd4e-f717f9e5bd53'::uuid
    AND material."base" IS NULL
    AND material."height" IS NULL
    AND material."type" = 'MATERIAL';
