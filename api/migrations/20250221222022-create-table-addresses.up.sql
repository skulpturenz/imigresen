CREATE TABLE IF NOT EXISTS addresses (
    user_uuid UUID NOT NULL REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    street_address TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    country_code TEXT REFERENCES countries(code),
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_addresses PRIMARY KEY(user_uuid, uuid)
);
--;;
CREATE OR REPLACE TRIGGER addresses_modtimestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
