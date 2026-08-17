-- Preserve operational and monetary calculation precision in storage. The UI
-- remains responsible for formatting values to two decimal places.
DO $$
DECLARE
    decimal_column RECORD;
BEGIN
    FOR decimal_column IN
        SELECT table_schema, table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND data_type = 'numeric'
          AND numeric_precision = 10
          AND numeric_scale = 2
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I ALTER COLUMN %I SET DATA TYPE DECIMAL(18,6)',
            decimal_column.table_schema,
            decimal_column.table_name,
            decimal_column.column_name
        );
    END LOOP;
END $$;
