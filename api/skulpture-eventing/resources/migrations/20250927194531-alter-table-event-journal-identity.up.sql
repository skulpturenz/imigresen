ALTER TABLE IF EXISTS event_journal
    ADD COLUMN IF NOT EXISTS id BIGINT GENERATED ALWAYS AS IDENTITY;
--;;
ALTER TABLE IF EXISTS event_journal
    DROP CONSTRAINT IF EXISTS pk_event_journal;
--;;
ALTER TABLE IF EXISTS event_journal
    ADD CONSTRAINT pk_event_journal PRIMARY KEY(id, entity_id, revision, event_agent);
