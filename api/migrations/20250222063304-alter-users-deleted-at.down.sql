ALTER TABLE users
    DROP COLUMN deleted_at;
--;;
ALTER TABLE users
    ADD deleted BOOLEAN;
