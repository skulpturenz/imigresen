CREATE TABLE IF NOT EXISTS event_journal_projections (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    entity_id TEXT NOT NULL,
    projection_type TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revision BIGINT NOT NULL,
    snapshot_data JSONB NOT NULL,
    last_updated_by TEXT NOT NULL,
    UNIQUE(entity_id, projection_type),
    CONSTRAINT pk_event_journal_projections PRIMARY KEY(id, entity_id, updated_at, last_updated_by)
)
--;;
CREATE OR REPLACE TRIGGER event_journal_projections_modtimestamp
    BEFORE UPDATE ON event_journal_projections
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
