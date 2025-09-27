ALTER TABLE IF EXISTS event_journal
    DROP CONSTRAINT IF EXISTS pk_event_journal;
--;;
ALTER TABLE IF EXISTS event_journal
    DROP COLUMN IF EXISTS id;
--;;
ALTER TABLE IF EXISTS event_journal
    ADD CONSTRAINT pk_event_journal PRIMARY KEY(entity_id, revision, event_agent);
