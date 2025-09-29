DO $$
DECLARE
    expected_rows_modified INTEGER := -1; -- TODO
    rows_modified_count INTEGER := 0;
BEGIN
    -- TODO
    GET DIAGNOSTICS rows_modified_count = ROW_COUNT; -- After each statement which modifies rows

    IF expected_rows_modified = rows_modified_count THEN
        RAISE INFO 'Expected result, rows modified %', rows_modified_count;
    ELSE
        RAISE EXCEPTION 'Unexpected error occurred, expected rows %, rows modified %', expected_rows_modified, rows_modified_count;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error: %', SQLERRM;
END $$;
