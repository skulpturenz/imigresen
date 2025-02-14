CREATE TABLE IF NOT EXISTS im42 (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    identification_documents UUID NOT NULL REFERENCES identification_documents(uuid),
    primary_caregiver UUID REFERENCES users(uuid),
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_im42 PRIMARY_KEY(user, uuid)
);

CREATE OR REPLACE TRIGGER im42_modtimestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
