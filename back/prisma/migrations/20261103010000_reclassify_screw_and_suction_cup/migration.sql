-- Incremental data correction: keep the existing names of the two additional
-- consumables confirmed by the user. Leave the earlier six-record migration intact.
UPDATE "Material" AS material
SET "type" = 'CONSUMABLE'
FROM (VALUES
    ('12759e60-d56d-4dfc-8f4e-a223c606fade'::uuid, 'TORNILLO DE PLASTICO', 'TOR-PLA-1'),
    ('5efea6dd-f15a-4f98-b1dc-9d62a4f45341'::uuid, 'VENTOSA MEDIANA', 'VEN-MED-1')
) AS confirmed("id", "name", "sku")
WHERE material."id" = confirmed."id"
    AND material."name" = confirmed."name"
    AND material."sku" = confirmed."sku"
    AND material."presentationId" = '9c60a860-90dc-4f8e-bee0-d0c92928695c'::uuid
    AND material."unitMeasureId" = '3cbf98f2-5502-477d-bd4e-f717f9e5bd53'::uuid
    AND material."base" IS NULL
    AND material."height" IS NULL
    AND material."type" = 'MATERIAL';
