import { Prisma } from '../../../generated/prisma/client.ts';
import { getDb } from '../baseRepository.js';
import { SQUARE_METER_UNIT_NAMES, SQUARE_METER_UNIT_SYMBOLS } from '../../public/js/constants/inventory.js';

export const findWasteTemplatePage = ({ supplierId, search, skip, take }) => getDb().$queryRaw(Prisma.sql`
    WITH candidates AS (
        SELECT m."id", m."name", LOWER(TRIM(m."name")) AS family_name,
            LEAST(CASE WHEN m."base" > 0 THEN m."base" END,
                  CASE WHEN m."height" > 0 THEN m."height" END) AS width,
            UPPER(TRIM(p."name")) = 'ROLLO' AS is_roll,
            offer."maxUnitCost" AS cost
        FROM "Material" m
        JOIN "Presentation" p ON p."id" = m."presentationId"
        JOIN "UnitMeasure" u ON u."id" = m."unitMeasureId"
        JOIN "SupplierMaterial" offer ON offer."materialId" = m."id"
        WHERE m."type" = 'MATERIAL' AND offer."supplierId" = ${supplierId}::uuid AND offer."isActive"
            AND (UPPER(u."symbol") IN (${Prisma.join([...SQUARE_METER_UNIT_SYMBOLS])})
                OR UPPER(u."name") IN (${Prisma.join([...SQUARE_METER_UNIT_NAMES])}))
            AND m."name" ILIKE ${`%${search}%`}
    ), ranked AS (
        SELECT *, MAX(cost) OVER (PARTITION BY family_name, width) AS family_cost,
            ROW_NUMBER() OVER (
                PARTITION BY CASE WHEN is_roll THEN "id"::text
                    ELSE jsonb_build_array(family_name, width)::text END
                ORDER BY "name", "id"
            ) AS rank
        FROM candidates
    ), templates AS (SELECT * FROM ranked WHERE rank = 1),
    page AS (SELECT * FROM templates ORDER BY "name", "id" OFFSET ${skip} LIMIT ${take})
    SELECT page."id", page.family_cost AS "maxUnitCost", totals.count AS total
    FROM (SELECT COUNT(*) FROM templates) totals LEFT JOIN page ON TRUE
    ORDER BY page."name", page."id"
`);
