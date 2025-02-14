CREATE TABLE IF NOT EXISTS addresses (
    user UUID NOT NULL REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    street_address TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    country TEXT REFERENCES countries(code),
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_addresses PRIMARY_KEY(user, uuid)
);

CREATE OR REPLACE TRIGGER addresses_modtimestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
