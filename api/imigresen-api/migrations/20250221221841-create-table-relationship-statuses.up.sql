CREATE TABLE IF NOT EXISTS relationship_statuses (
    code TEXT NOT NULL,
    status TEXT NOT NULL,
    CONSTRAINT pk_relationship_statuses PRIMARY KEY(code)
);
