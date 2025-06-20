ALTER TABLE users
    ADD deleted_at TIMESTAMP WITH TIME ZONE;
--;;
ALTER TABLE users
    DROP COLUMN deleted;
