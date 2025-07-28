CREATE TABLE IF NOT EXISTS event_journal (
    entity_id TEXT NOT NULL,
    revision BIGINT NOT NULL,
    event_agent TEXT NOT NULL,
    time_occurred TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_observed TIMESTAMP WITH TIME ZONE,
    event_data JSONB NOT NULL,
    CONSTRAINT pk_event_journal PRIMARY KEY(entity_id, revision, event_agent)
)
