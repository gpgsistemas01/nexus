ALTER TABLE "Product" RENAME TO "Material";
ALTER TABLE "SupplierProduct" RENAME TO "SupplierMaterial";

-- Rename every persisted product reference, including snapshot columns such as
-- productName and correctedProductId.
DO $$
DECLARE
    column_record RECORD;
    new_name TEXT;
BEGIN
    FOR column_record IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND (column_name LIKE '%product%' OR column_name LIKE '%Product%')
    LOOP
        new_name := replace(replace(column_record.column_name, 'Product', 'Material'), 'product', 'material');
        EXECUTE format(
            'ALTER TABLE %I.%I RENAME COLUMN %I TO %I',
            current_schema(), column_record.table_name, column_record.column_name, new_name
        );
    END LOOP;
END $$;

-- PostgreSQL preserves constraint and index names when their table or columns
-- are renamed, so update those database object names explicitly as well.
DO $$
DECLARE
    constraint_record RECORD;
    new_name TEXT;
BEGIN
    FOR constraint_record IN
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_schema = current_schema()
          AND (constraint_name LIKE '%product%' OR constraint_name LIKE '%Product%')
    LOOP
        new_name := replace(replace(constraint_record.constraint_name, 'Product', 'Material'), 'product', 'material');
        EXECUTE format(
            'ALTER TABLE %I.%I RENAME CONSTRAINT %I TO %I',
            current_schema(), constraint_record.table_name, constraint_record.constraint_name, new_name
        );
    END LOOP;
END $$;

DO $$
DECLARE
    index_record RECORD;
    new_name TEXT;
BEGIN
    FOR index_record IN
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = current_schema()
          AND (indexname LIKE '%product%' OR indexname LIKE '%Product%')
    LOOP
        new_name := replace(replace(index_record.indexname, 'Product', 'Material'), 'product', 'material');
        EXECUTE format(
            'ALTER INDEX %I.%I RENAME TO %I',
            current_schema(), index_record.indexname, new_name
        );
    END LOOP;
END $$;
