CREATE TABLE IF NOT EXISTS relationship_statuses (
    uuid UUID NOT NULL UNIQUE,
    status TEXT NOT NULL,
    code TEXT NOT NULL,
    CONSTRAINT pk_relationship_statuses PRIMARY_KEY(uuid, code)
);
