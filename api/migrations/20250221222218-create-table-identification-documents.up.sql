CREATE TABLE IF NOT EXISTS identification_documents (
    user_uuid UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    country_code TEXT NOT NULL UNIQUE REFERENCES countries(code),
    identity_card_number TEXT,
    birth_certificate_number TEXT, -- birth certificate / adoption number / overseas birth cert (borang w)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_identification_documents PRIMARY KEY(user_uuid, uuid, country_code)
);
--;;
CREATE OR REPLACE TRIGGER identification_documents_modtimestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
